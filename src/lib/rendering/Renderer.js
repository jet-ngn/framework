import DataBindingInterpolation from '../data/DataBindingInterpolation'
import AttributeList from '../AttributeList'

import { parseHTML } from '../parsing/HTMLParser'
import { html } from '../parsing/tags'
import { removeEventsByView } from '../events/Bus'
import { emitInternal } from '../events/InternalBus'
import { addDOMEventHandler, removeDOMEventsByNode, removeDOMEventsByView } from '../events/DOMBus'

import {
  registerAttributeBinding,
  registerContentBinding,
  registerPropertyBinding,
  registerViewBinding,
  removeBindingsByView
} from '../data/DataRegistry'

export function * getTemplateRenderingTasks ({ app, view, element, template, childViews, routers, options, stagedViews } = {}) {
  const retainFormatting = element.tagName === 'PRE',
        { replace = false, append = false } = options ?? {},
        { name } = view,
        { attributes, properties, listeners, viewConfig, routeConfig } = template,
        { bindings, fragment, templates } = parseHTML(template, { retainFormatting }),
        { firstElementChild } = fragment,
        hasMultipleNodes = fragment.children.length > 1

  if (properties) {
    setProperties({
      app,
      view,
      element: firstElementChild,
      properties,
      hasMultipleNodes
    })
  }
  
  if (attributes) {
    setAttributes({
      app,
      view,
      element: firstElementChild,
      attributes,
      hasMultipleNodes
    })
  }

  if (listeners) {
    bindListeners({
      view,
      element: firstElementChild,
      listeners,
      hasMultipleNodes
    })
  }

  for (const id in templates) {
    yield * getTemplateRenderingTasks({
      app,
      view,
      element: fragment.getElementById(id),
      template: templates[id],
      childViews,
      routers,
      options: { replace: true },
      stagedViews
    })
  }

  const keys = Object.keys(bindings)

  if (keys.length > 0) {
    yield [`Initialize "${name}" view content bindings`, async ({ next }) => {
      await Promise.allSettled(keys.map(async id => {
        await registerContentBinding({
          app,
          view,
          element: fragment.getElementById(id),
          interpolation: bindings[id],
          childViews,
          routers,
          options: { retainFormatting }
        }).reconcile(true)
      }))

      next()
    }]
  }

  if (viewConfig) {
    yield * getChildViewRenderingTasks({
      app,
      view,
      element: firstElementChild,
      config: viewConfig,
      childViews,
      routers,
      stagedViews
    })
  } else if (routeConfig) {
    const { childRouters, parentRouter } = routers ?? {}
    
    app.addChildRouter(childRouters, childViews, {
      parentView: view,
      parentRouter,
      element: firstElementChild,
      routes: routeConfig
    })
  }

  yield [`Render "${name}" view${replace ? ' child' : ''} template`, ({ next }) => {
    replace && removeDOMEventsByNode(element)
    element[replace ? 'replaceWith' : append ? 'append' : 'replaceChildren'](fragment)
    next()
  }]
}

export function * getViewMountingTasks (views) {
  for (const view of views) {
    yield [`Mount "${view.name}" view`, async ({ next }) => {
      await emitInternal(view, 'mount')
      next()
    }]
  }
}

export function * getViewRemovalTasks ({ app, collection, view, fireUnmountEvent = true, stagedViews } = {}) {
  const kids = app.getTreeNode(collection, view)

  if (kids) {
    for (const [child] of kids) {
      yield * getViewRemovalTasks({
        app,
        collection: kids,
        view: child,
        fireUnmountEvent,
        stagedViews
      })
    }
  }

  const { name } = view

  yield [`Remove "${name}" view`, async ({ next }) => {
    fireUnmountEvent && await emitInternal(view, 'unmount')
    removeDOMEventsByView(view)
    removeEventsByView(view)
    removeBindingsByView(view)
    app.removeTreeNode(collection, view)
    stagedViews && stagedViews.delete(view)
    next()
  }]
}

export function * getViewRenderingTasks ({ app, view, childViews, routers, options = null, stagedViews } = {}) {
  const { config, name } = view

  if (config.on?.hasOwnProperty('beforeMount')) {
    yield [`Run "${name}" view beforeMount tasks (if applicable)`, async ({ next, restart }) => {
      let stop = false
  
      await emitInternal(view, 'beforeMount', {
        abort: () => stop = true
      })
  
      if (!stop) {
        return next()
      }
  
      await emitInternal(view, 'abortMount', {
        resume: () => next(),
        retry: () => restart()
      })
    }] 
  }
  
  yield * getTemplateRenderingTasks({
    app,
    view,
    element: view.element,
    template: view.config.render?.call(view) ?? html``,
    childViews,
    routers,
    options,
    stagedViews
  })

  stagedViews && stagedViews.add(view)
}

function bindListeners ({ view, element, listeners, hasMultipleNodes }) {
  validateBinding('listeners', element, hasMultipleNodes)

  for (const evt in listeners) {
    for (const { handler, cfg } of listeners[evt]) {
      addDOMEventHandler(view, element, evt, handler, cfg)
    }
  }
}

function * getChildViewRenderingTasks ({ app, view, element, config, childViews, routers, stagedViews }) {
  if (config instanceof DataBindingInterpolation) {
    return registerViewBinding(...arguments).reconcile(true, stagedViews)
  }

  const [childView, children] = app.addChildView(childViews, { parent: view, element, config })
  
  yield * getViewRenderingTasks({
    app,
    view: childView,
    childViews: children,
    routers,
    stagedViews
  })
}

function setAttribute ({ app, view, element, name, value }) {
  if (value instanceof DataBindingInterpolation) {
    return registerAttributeBinding(...arguments).reconcile(true)
  }

  const existing = element.getAttribute(name)?.trim().split(' ').map(item => item.trim()) ?? []

  if (Array.isArray(value)) {
    return new AttributeList(app, view, element, name, [...(existing ?? []), ...value]).reconcile(true)
  }

  const type = typeof value

  if (type !== 'object') {
    switch (typeof value) {
      case 'string':
      case 'number': return element.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
      case 'boolean': return value && element.setAttribute(name, '')
      default: throw new TypeError(`"${view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
    }
  }

  for (const slug of Object.keys(value)) {
    setAttribute({
      app,
      view,
      element,
      name: `${name}-${slug}`,
      value: value[slug]
    })
  }
}

function setAttributes ({ app, view, element, attributes, hasMultipleNodes }) {
  validateBinding('attribute', element, hasMultipleNodes)

  for (const name in attributes ?? {}) {
    setAttribute({
      app,
      view,
      element,
      name,
      value: attributes[name]
    })
  }
}

function setProperties ({ app, view, element, properties, hasMultipleNodes }) {
  validateBinding('property', element, hasMultipleNodes)

  for (let name in properties ?? {}) {
    const value = properties[name]

    if (value instanceof DataBindingInterpolation) {
      registerPropertyBinding({ app, view, element, name, interpolation: value }).reconcile(true)
      continue
    }

    element[name] = value
  }
}

function validateBinding (item, element, hasMultipleNodes) {
  if (!element) throw new Error(`Cannot bind ${item} to non-element nodes`)
  if (hasMultipleNodes) throw new Error(`Cannot bind ${item} to more than one node`)
}