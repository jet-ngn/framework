import Session from '../session/Session'
import View from '../../View'
import Route from '../routing/Route'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import AttributeList from './AttributeList'

import Unauthorized from '../views/401.js'
import Forbidden from '../views/403.js'
import NotFound from '../views/404.js'

import { parseHTML } from './HTMLParser'
import { addDOMEventHandler, removeDOMEventsByNode } from '../events/DOMBus'
import { logBindings, removeBindingsByView } from '../data/DataRegistry'
import { removeEventsByView } from '../events/Bus'
// import { removeEventsByView } from '../events/Bus'
import { INTERNAL_ACCESS_KEY, PATH, TREE } from '../../env'
import { html } from './tags'

import {
  registerContentBinding,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../data/DataRegistry'
import { getMatchingRoute } from '../routing/utilities'

async function fireBeforeMountEvent (view, abort) {
  let stop = false

  await view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
    abort: async () => {
      stop = true

      await view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
        resume: () => stop = false,

        retry: async () => {
          stop = false
          await fireBeforeMountEvent(...arguments)
        }
      })
    }
  })

  stop && abort()
}

export function getViewRoutingTasks (view, options) {
  const match = getMatchingRoute(view.config.routes)

  if (match) {
    return getViewInitializationTasks({
      parent: view,
      rootNode: view.rootNode,
      config: match.config,
      route: new Route(view.parent, match)
    }, { setDeepestRoute: true })
  }

  // If no route matches, render view template (if one exists)
  return getViewRenderingTasks(...arguments)
}

export function getViewRenderingTasks (view, { setDeepestRoute = false } = {}) {
  if (setDeepestRoute) {
    TREE.deepestRoute = view
  }
  
  return getTemplateRenderingTasks({
    view,
    template: view.config.render?.call(view) ?? html``
  })
}

export function getViewInitializationTasks ({ parent = null, rootNode, config, route = null }, { init = null, setDeepestRoute = false } = {}) {
  const view = new View(parent, rootNode, config, route)

  if (!!init) {
    init(view)
  }

  if (!!parent) {
    parent.children.add(view)
  } else {
    TREE.rootView = view
  }

  const options = arguments[1]
  return !!config.routes ? getViewRoutingTasks(view, options) : getViewRenderingTasks(view, options)
}

export function getTemplateRenderingTasks ({ view, template, placeholder = null } = {}) {
  const tasks = [],
        { name } = view,
        retainFormatting = view.rootNode.tagName === 'PRE',
        { fragment, bindings, templates } = parseHTML(template, retainFormatting),
        { attributes, properties, listeners, viewConfig } = template,
        node = fragment.firstElementChild,
        hasMultipleNodes = fragment.children.length > 1,
        args = [node, hasMultipleNodes]

  !placeholder && tasks.push({
    name: `Fire "${name}" beforeMount event`,
    meta: { view },

    callback: async (abort) => {
      if (PATH.remaining.length > 0 && (view === TREE.deepestRoute || viewIsChildOfDeepestRoute(view))) {
        return
      }

      await fireBeforeMountEvent(view, abort)
    }
  })

  !!properties && tasks.push({
    name: `Apply properties to "${name}" rootNode`,
    meta: { view, node, properties },
    callback: () => bind('properties', view, properties, ...args, setProperty)
  })

  !!attributes && tasks.push({
    name: `Apply attributes to "${name}" rootNode or child node`,
    meta: { view, node, attributes },
    callback: () => bind('attributes', view, attributes, ...args, setAttribute)
  })

  !!listeners && tasks.push({
    name: `Apply listeners to "${name}" rootNode or child node`,
    meta: { view, node, listeners },
    callback: () => bindListeners(view, listeners, ...args)
  })

  !!bindings && tasks.push({
    name: `Process "${name}" Bindings`,
    meta: { view, fragment, bindings, retainFormatting },
    callback: () => processBindings(view, fragment, bindings, retainFormatting)
  })

  !!templates && Object.keys(templates).forEach(id => {
    tasks.push(...getTemplateRenderingTasks({
      view,
      template: templates[id],
      placeholder: fragment.getElementById(id)
    }))
  })

  if (viewConfig) {
    if (viewConfig instanceof DataBindingInterpolation) {
      tasks.push({
        name: `Bind ${viewConfig.name ? `"${viewConfig.name}" as` : ''} child view to "${name}"`,
        meta: { view, config: viewConfig },

        callback: () => {
          const binding = registerViewBinding(view, node, viewConfig)
          return binding.reconcile()
        }
      })
    } else {
      tasks.push(...getViewInitializationTasks({
        parent: view,
        rootNode: node,
        config: viewConfig
      }))
    }
  }

  if (!!placeholder) {
    return [...tasks, {
      name: `Replace "${name}" placeholder "${placeholder.id}" template`,
      meta: { view, placeholder, fragment },
      callback: () => placeholder.replaceWith(fragment)
    }]
  }

  return [...tasks, {
    name: `Render "${name}"`,
    callback: async abort => await renderView(view, fragment, abort)
  }, {
    name: `Mount "${name}"`,
    meta: { view },
    callback: async () => await view.emit(INTERNAL_ACCESS_KEY, 'mount')
  }]
}

export async function renderView (view, fragment, abort) {
  if (PATH.remaining.length > 0) {
    if (view === TREE.deepestRoute) {
      return await replaceView(view, NotFound, abort)
    }

    if (viewIsChildOfDeepestRoute(view)) {
      return
    }
  }

  if (!!view.permissions) {
    if (!Session.user) {
      return replaceView(view, Unauthorized, abort)
    }

    if (!view.isAccessibleTo(...Session.user.roles)) {
      return await replaceView(view, Forbidden, abort)
    }
  }

  view.rootNode.replaceChildren(fragment)
}

export async function unmountView (view) {
  for (let child of view.children) {
    await unmountView(child)
  }

  view.children.clear()
  await view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  
  removeDOMEventsByNode(view.rootNode)
  removeEventsByView(view)
  removeBindingsByView(view)
}

function bind (type, view, collection, root, hasMultipleRoots, cb) {
  validateBinding(type, root, hasMultipleRoots, () => {
    for (let item in collection ?? {}) {
      cb(view, root, item, collection[item])
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

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

async function replaceView (view, config, abort) {
  const isRoot = view === TREE.rootView
  view = new View(view.parent, view.rootNode, config, new Route(view.parent, { url: new URL(PATH.current, PATH.base) }))
  
  await fireBeforeMountEvent(view, abort)
  view.parent?.children.add(view)

  if (isRoot) {
    TREE.rootView = view
  }

  view.rootNode.replaceChildren(parseHTML(config.render?.call(view) ?? html``).fragment)
  return await view.emit(INTERNAL_ACCESS_KEY, 'mount')
}

function processBindings (view, fragment, bindings, retainFormatting) {
  Object.keys(bindings).forEach(id => {
    const binding = registerContentBinding(view, fragment.getElementById(id), bindings[id], retainFormatting)
    binding.reconcile()
  })
}

function setAttribute (view, node, name, value) {
  if (value instanceof DataBindingInterpolation) {
    const binding = registerAttributeBinding(view, node, name, value)
    return binding.reconcile()
  }

  const existing = getExistingAttributeValue(node, name)

  if (Array.isArray(value)) {
    const list = new AttributeList(view, node, name, [...(existing ?? []), ...value])
    return node.setAttribute(name, list.value)
  }

  switch (typeof value) {
    case 'string':
    case 'number': return node.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
    case 'boolean': return value && node.setAttribute(name, '')
    case 'object': return setNamespacedAttribute(view, node, name, value)

    default: throw new TypeError(`"${view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
  }
}

function setNamespacedAttribute (view, node, name, cfg) {
  if (typeof cfg === 'object') {
    return Object.keys(cfg).forEach(slug => setAttribute(view, node, `${name}-${slug}`, cfg[slug]))
  }

  setAttribute(view, node, `${name}-${slug}`, cfg)
}

function setProperty (view, node, name, value) {
  if (value instanceof DataBindingInterpolation) {
    const binding = registerPropertyBinding(view, node, name, value)
    return binding.reconcile()
  }

  node[name] = value
}

function validateBinding (item, node, hasMultipleRoots, cb) {
  if (!node) {
    throw new Error(`Cannot bind ${item} to non-element nodes`)
  }

  if (hasMultipleRoots) {
    throw new Error(`Cannot bind ${item} to more than one node`)
  }

  cb()
}

function viewIsChildOfDeepestRoute (view) {
  if (!view) {
    return false
  }

  return view.parent === TREE.deepestRoute || viewIsChildOfDeepestRoute(view.parent)
}