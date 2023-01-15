import Session from '../session/Session'
import DataBindingInterpolation from '../data/DataBindingInterpolation'

// import Unauthorized from './views/401.js'
// import Forbidden from './views/403.js'

import { parseHTML } from '../parsing/HTMLParser'
import { html } from '../parsing/tags'
import { removeEventsByView } from '../events/Bus'
import { emitInternal } from '../events/InternalBus'
import { addDOMEventHandler, removeDOMEventsByNode, removeDOMEventsByView } from '../events/DOMBus'

import {
  getContentBindingRegistrationTasks,
  getAttributeBindingRegistrationTasks,
  getPropertyBindingRegistrationTasks,
  getViewBindingRegistrationTasks,
  removeBindingsByView,
} from '../data/DataRegistry'

export function * getTemplateRenderingTasks (app, view, element, template, childViews, routers, options, stagedViews) {
  const retainFormatting = element.tagName === 'PRE',
        { replace = false, append = false } = options ?? {},
        { name } = view,
        { attributes, properties, listeners, viewConfig, routeConfig } = template,
        { bindings, fragment, templates } = parseHTML(template, { retainFormatting }),
        { firstElementChild } = fragment,
        hasMultipleNodes = fragment.children.length > 1

  if (properties) yield * getPropertyBindingTasks(app, view, firstElementChild, properties, hasMultipleNodes)
  if (attributes) yield * getAttributeBindingTasks(app, view, firstElementChild, attributes, hasMultipleNodes)
  if (listeners) yield * getListenerBindingTasks(view, firstElementChild, listeners, hasMultipleNodes)

  for (const id in templates) yield * getTemplateRenderingTasks(app, view, fragment.getElementById(id), templates[id], childViews, routers, { replace: true }, stagedViews)
  for (const id in bindings) yield * getContentBindingRegistrationTasks(app, view, fragment.getElementById(id), bindings[id], childViews, routers, { retainFormatting }, stagedViews)
  
  if (viewConfig) yield * getChildViewRenderingTasks(app, view, firstElementChild, viewConfig, childViews, routers, stagedViews)  
  
  else if (routeConfig) {
    const { childRouters, parentRouter } = routers ?? {}
    
    yield * app.getChildRouterInitializationTasks(childRouters, childViews, {
      parentView: view,
      parentRouter,
      element: firstElementChild,
      routes: routeConfig
    }, stagedViews)
  }

  yield [`${replace ? `Insert child template into "${name}" view root element` : `Insert "${name}" view template into parent element`}`, async ({ next }) => {
    if (replace) {
      removeDOMEventsByNode(element)
    } else {
      const observer = new MutationObserver(mutations => {
        observer.disconnect()
        next()
      })
  
      observer.observe(element, { childList: true })
    }

    element[replace ? 'replaceWith' : append ? 'append' : 'replaceChildren'](fragment)
    replace && next()
  }]
}

export function * getViewRemovalTasks (app, collection, view, fireUnmountEvent = true) {
  const kids = app.getTreeNode(collection, view)

  if (kids) {
    for (const [child] of kids) {
      yield * getViewRemovalTasks(app, kids, child)
    }
  }

  yield [`Unmount "${view.name}" view`, async ({ next }) => {
    fireUnmountEvent && await emitInternal(view, 'unmount')
    removeDOMEventsByView(view)
    removeEventsByView(view)
    removeBindingsByView(view)
    app.removeTreeNode(collection, view)
    next()
  }]
}

export function * getViewRenderingTasks (app, view, childViews, routers, options, stagedViews) {
  const { name, config } = view

  // TODO: Handle permissions

  if (config.on?.hasOwnProperty('beforeMount')) {
    let stop = false

    yield [`Run "${name}" beforeMount handler`, async ({ next, restart }) => {
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
  
  yield * getTemplateRenderingTasks(app, view, view.element, view.config.render?.call(view) ?? html``, childViews, routers, options, stagedViews)

  stagedViews.add(view)
  
}

function * getAttributeApplicationTasks (app, view, element, attribute, value) {
  if (value instanceof DataBindingInterpolation) {
    return yield * getAttributeBindingRegistrationTasks(app, view, element, attribute, value)
  }

  const existing = element.getAttribute(attribute)?.trim().split(' ').map(item => item.trim()) ?? []

  if (Array.isArray(value)) {
    return yield * getAttributeListBindingTasks(app, view, element, attribute, [...(existing ?? []), ...value])
  }

  const type = typeof value

  if (type !== 'object') {
    switch (typeof value) {
      case 'string':
      case 'number': return yield [`Apply attribute "${attribute}"`, ({ next }) => {
        element.setAttribute(attribute, `${existing.join(' ')} ${value}`.trim())
        next()
      }]
  
      case 'boolean': return yield [`Apply boolean attribute "${attribute}"`, ({ next }) => {
        value && element.setAttribute(attribute, '')
        next()
      }]
  
      default: throw new TypeError(`"${view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
    }
  }

  for (const slug of Object.keys(value)) {
    yield * getAttributeApplicationTasks(app, view, element, `${attribute}-${slug}`, value[slug])
  }
}

function * getAttributeBindingTasks (app, view, element, attributes, hasMultipleNodes) {
  validateBinding('attribute', element, hasMultipleNodes)

  for (let attribute in attributes ?? {}) {
    yield * getAttributeApplicationTasks(app, view, element, attribute, attributes[attribute])
  }
}

function * getListenerBindingTasks (view, element, listeners, hasMultipleNodes) {
  validateBinding('listeners', element, hasMultipleNodes)

  for (const evt in listeners) {
    for (const { handler, cfg } of listeners[evt]) {
      yield [`Apply "${evt}" listener`, ({ next }) => {
        addDOMEventHandler(view, element, evt, handler, cfg)
        next()
      }]
    }
  }
}

function * getPropertyBindingTasks (app, view, element, properties, hasMultipleNodes) {
  validateBinding('property', element, hasMultipleNodes)

  for (let property in properties ?? {}) {
    const value = properties[property]

    if (value instanceof DataBindingInterpolation) {
      yield * getPropertyBindingRegistrationTasks(app, view, element, property, value)
      continue
    }

    yield [`Apply property "${property}"`, ({ next }) => {
      element[property] = value
      next()
    }]
  }
}

function * getChildViewRenderingTasks (app, view, element, viewConfig, childViews, routers, stagedViews) {
  if (viewConfig instanceof DataBindingInterpolation) yield * getViewBindingRegistrationTasks(...arguments)
  
  else yield * getViewRenderingTasks(app, ...app.addChildView(childViews, {
    parent: view,
    element,
    config: viewConfig
  }), routers, null, stagedViews)
}

function validateBinding (item, element, hasMultipleNodes) {
  if (!element) throw new Error(`Cannot bind ${item} to non-element nodes`)
  if (hasMultipleNodes) throw new Error(`Cannot bind ${item} to more than one node`)
}