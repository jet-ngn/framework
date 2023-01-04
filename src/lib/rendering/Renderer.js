import Session from '../session/Session'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import AttributeList from './AttributeList'

import Unauthorized from './views/401.js'
import Forbidden from './views/403.js'

import { parseHTML } from './HTMLParser'
import { addDOMEventHandler } from '../events/DOMBus'
import { emitInternal } from '../events/Bus'
import { html } from './tags'

import {
  registerContentBinding,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../data/DataRegistry'

export async function renderTemplate (app, parentView, template, targetElement, childViews, { tasks, replace = false, replaceChildren = false } = {}, { parentRouter, childRouters } = {}) {
  const retainFormatting = targetElement.tagName === 'PRE',
        { attributes, properties, listeners, routeConfig, viewConfig } = template,
        { bindings, fragment, templates } = parseHTML(template, { retainFormatting }),
        element = fragment.firstElementChild,
        hasMultipleNodes = fragment.children.length > 1,
        args = [element, hasMultipleNodes]

  !!properties && await bind('properties', app, parentView, properties, ...args, setProperty)
  !!attributes && await bind('attributes', app, parentView, attributes, ...args, setAttribute)
  !!listeners && await bindListeners(parentView, listeners, ...args)

  for (const id in templates) {
    await renderTemplate(app, parentView, templates[id], fragment.getElementById(id), arguments[4], { tasks, replace: true }, arguments[6])
  }

  for (const id in bindings) {
    await registerContentBinding(app, parentView, childViews, fragment.getElementById(id), bindings[id], { retainFormatting }, arguments[6]).reconcile()
  }

  if (!!viewConfig) {
    await processChildView(app, parentView, childViews, { element, config: viewConfig }, { tasks }, arguments[6])
  } else if (!!routeConfig) {
    app.tree.addChildRouter(childRouters, childViews, { parentView, parentRouter, element, routes: routeConfig })
  }

  targetElement[replace ? 'replaceWith' : replaceChildren ? 'replaceChildren' : 'append'](fragment)
}

export async function mountView (app, view, childViews, { tasks, deferMount = false, replaceChildren = false } = {}, routers) {
  // TODO: Check permissions
  let stop = false

  await emitInternal(view, 'beforeMount', {
    abort: async () => {
      stop = true

      await emitInternal(view, 'abortMount', {
        resume: () => stop = false,

        retry: async () => {
          stop = false
          await mountView(...arguments)
        }
      })
    }
  })

  if (stop) {
    return
  }

  if (view.rendered) {
    await emitInternal(view, 'remount')
  } else {
    await emitInternal(view, 'render')
    await renderTemplate(app, view, view.config.render?.call(view) ?? html``, view.element, childViews, { tasks, replaceChildren }, routers)
  }

  const mountTask = async () => await emitInternal(view, 'mount')
  deferMount ? tasks.push(mountTask) : await mountTask()
}

export async function unmountView (view) {
  await emitInternal(view, 'unmount')
}

async function bind (app, type, view, collection, root, hasMultipleRoots, cb) {
  await validateBinding(type, root, hasMultipleRoots, async () => {
    for (let item in collection ?? {}) {
      await cb(app, view, root, item, collection[item])
    }
  })
}

async function bindListeners (view, listeners, root, hasMultipleRoots) {
  await validateBinding('listeners', root, hasMultipleRoots, async () => {
    for (let evt in listeners ?? {}) {
      listeners[evt].forEach(({ handler, cfg }) => addDOMEventHandler(view, root, evt, handler, cfg))
    }
  })
}

function getExistingAttributeValue (element, name) {
  const value = element.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

async function processChildView (app, parent, childViews, { element, config }, { tasks }, routers) {
  if (config instanceof DataBindingInterpolation) {
    return await registerViewBinding(app, parent, childViews, element, config, routers).reconcile()
  }

  await mountView(app, ...app.tree.addChildView(childViews, { parent, element, config }), { tasks }, routers)
}

async function setAttribute (app, view, element, name, value) {
  if (value instanceof DataBindingInterpolation) {
    return await registerAttributeBinding(app, view, element, name, value).reconcile()
  }

  const existing = getExistingAttributeValue(element, name)

  if (Array.isArray(value)) {
    return element.setAttribute(name, await (new AttributeList(app, view, element, name, [...(existing ?? []), ...value])).getValue())
  }

  switch (typeof value) {
    case 'string':
    case 'number': return element.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
    case 'boolean': return value && element.setAttribute(name, '')
    case 'object': return await setNamespacedAttribute(app, view, element, name, value)

    default: throw new TypeError(`"${view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
  }
}

async function setNamespacedAttribute (app, view, element, name, cfg) {
  if (typeof cfg === 'object') {
    for (const slug of Object.keys(cfg)) {
      await setAttribute(app, view, element, `${name}-${slug}`, cfg[slug])
    }

    return
  }

  await setAttribute(app, view, element, `${name}-${slug}`, cfg)
}

async function setProperty (app, view, element, name, value) {
  if (value instanceof DataBindingInterpolation) {
    return await registerPropertyBinding(app, view, element, name, value).reconcile()
  }

  element[name] = value
}

async function validateBinding (item, element, hasMultipleRoots, cb) {
  if (!element) {
    throw new Error(`Cannot bind ${item} to non-element nodes`)
  }

  if (hasMultipleRoots) {
    throw new Error(`Cannot bind ${item} to more than one node`)
  }

  await cb()
}