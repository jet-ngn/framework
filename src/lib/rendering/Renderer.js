import Session from '../session/Session'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import AttributeList from './AttributeList'

import Unauthorized from './views/401.js'
import Forbidden from './views/403.js'

import { parseHTML } from './HTMLParser'
import { emitInternal, removeEventsByView } from '../events/Bus'
import { addDOMEventHandler, removeDOMEventsByNode } from '../events/DOMBus'
import { html } from './tags'

import {
  getContentBindingRegistrationTasks,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding,
  removeBindingsByView
} from '../data/DataRegistry'

export function * getTemplateRenderingTasks (app, view, template, targetElement, childViews, routers, options, callback) {
  const retainFormatting = targetElement.tagName === 'PRE',
        { replace = false, append = false } = options ?? {},
        { name } = view,
        { attributes, properties, listeners, viewConfig, routeConfig } = template,
        { bindings, fragment, templates } = parseHTML(template, { retainFormatting }),
        element = fragment.firstElementChild,
        hasMultipleNodes = fragment.children.length > 1,
        args = [element, hasMultipleNodes]

  if (properties) yield [`Apply properties`, ({ next }) => {
    bind('properties', app, view, properties, ...args, setProperty)
    next()
  }]
  
  if (attributes) yield [`Apply attributes`, ({ next }) => {
    bind('attributes', app, view, attributes, ...args, setAttribute)
    next()
  }]

  if (listeners) yield [`Apply listeners`, ({ next }) => {
    bindListeners(view, listeners, ...args)
    next()
  }]

  for (const id in templates) yield * getTemplateRenderingTasks(app, view, templates[id], fragment.getElementById(id), childViews, routers, { replace: true })
  for (const id in bindings) yield * getContentBindingRegistrationTasks(app, view, bindings[id], fragment.getElementById(id), childViews, routers, { retainFormatting })
  
  if (viewConfig) yield * processChildView(app, view, viewConfig, element, childViews, routers)  
  
  else if (routeConfig) yield [`Initialize "${name}" child router`, ({ next }) => {
    const { childRouters, parentRouter } = routers ?? {}
    app.tree.initChildRouter(childRouters, childViews, { parentView: view, parentRouter, element, routes: routeConfig }, next)
  }]

  yield [`${replace ? `Insert child template into "${name}" root element` : `Insert "${name}" view template into DOM`}`, ({ next }) => {
    if (replace) {
      removeDOMEventsByNode(targetElement)
    } else {
      const observer = new MutationObserver(mutations => {
        observer.disconnect()
        next()
      })
  
      observer.observe(targetElement, { childList: true })
    }

    callback && callback(fragment.childNodes)
    targetElement[replace ? 'replaceWith' : append ? 'append' : 'replaceChildren'](fragment)

    if (replace) {
      next()
    }
  }]
}

export function * getViewRenderingTasks (app, view, childViews, routers, options) {
  const { name, config } = view

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
  
  yield * getTemplateRenderingTasks(app, view, view.config.render?.call(view) ?? html``, view.element, childViews, routers, options)
  
  yield [`Run "${name}" mount handler`, async ({ next }) => {
    await emitInternal(view, 'mount')
    next()
  }]
}

function * processChildView (app, view, viewConfig, element, childViews, routers) {
  if (viewConfig instanceof DataBindingInterpolation) yield [`Initialize "${view.name}" View Binding`, ({ next }) => {
    registerViewBinding(...arguments).reconcile(next)
  }]
    
  else yield * getViewRenderingTasks(app, ...app.tree.addChildView(childViews, {
    parent: view,
    element,
    config: viewConfig
  }), childViews, routers)
}

function bind (app, type, view, collection, root, hasMultipleRoots, cb) {
  validateBinding(type, root, hasMultipleRoots, () => {
    for (let item in collection ?? {}) {
      cb(app, view, root, item, collection[item])
    }
  })
}

function bindListeners (view, listeners, root, hasMultipleRoots) {
  validateBinding('listeners', root, hasMultipleRoots, () => {
    for (let evt in listeners ?? {}) {
      listeners[evt].forEach(({ handler, cfg }) => addDOMEventHandler(view, root, evt, handler, cfg))
    }
  })
}

function getExistingAttributeValue (element, name) {
  const value = element.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

function setAttribute (app, view, element, name, value) {
  if (value instanceof DataBindingInterpolation) {
    return registerAttributeBinding(app, view, element, name, value).reconcile()
  }

  const existing = getExistingAttributeValue(element, name)

  if (Array.isArray(value)) {
    return element.setAttribute(name, new AttributeList(app, view, element, name, [...(existing ?? []), ...value]).value)
  }

  switch (typeof value) {
    case 'string':
    case 'number': return element.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
    case 'boolean': return value && element.setAttribute(name, '')
    case 'object': return setNamespacedAttribute(app, view, element, name, value)

    default: throw new TypeError(`"${view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
  }
}

function setNamespacedAttribute (app, view, element, name, cfg) {
  if (typeof cfg !== 'object') {
    return setAttribute(app, view, element, `${name}-${slug}`, cfg)
  }

  for (const slug of Object.keys(cfg)) {
    setAttribute(app, view, element, `${name}-${slug}`, cfg[slug])
  }
}

function setProperty (app, view, element, name, value) {
  if (value instanceof DataBindingInterpolation) {
    return registerPropertyBinding(app, view, element, name, value).reconcile()
  }

  element[name] = value
}

function validateBinding (item, element, hasMultipleRoots, cb) {
  if (!element) throw new Error(`Cannot bind ${item} to non-element nodes`)
  if (hasMultipleRoots) throw new Error(`Cannot bind ${item} to more than one node`)
  cb()
}