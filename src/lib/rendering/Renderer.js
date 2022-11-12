import Session from '../session/Session'
import View from '../../View'
import RouteManager from '../routing/RouteManager'
import Route from '../routing/Route'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import AttributeList from './AttributeList'

import Unauthorized from '../views/401.js'
import Forbidden from '../views/403.js'
import NotFound from '../views/404.js'

import { parseHTML } from './HTMLParser'
import { addDOMEventHandler } from '../events/DOMBus'
// import { removeEventsByView } from '../events/Bus'
import { INTERNAL_ACCESS_KEY, PATH } from '../../env';
import { html } from './tags'

import {
  registerContentBinding,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../data/DatasetRegistry'

export function getTemplateRenderingTasks (view, template, placeholder = null, tree) {
  const tasks = []
  const retainFormatting = view.rootNode.tagName === 'PRE'
  const { fragment, bindings, templates } = parseHTML(template, retainFormatting)
  const { attributes, properties, listeners, viewConfig } = template
  const node = fragment.firstElementChild
  const hasMultipleNodes = fragment.children.length > 1
  const args = [node, hasMultipleNodes]

  !placeholder && tasks.push({
    name: 'Fire Before Mount event',

    callback: async (abort) => {
      if (PATH.remaining.length > 0 && (view === tree.deepestRoute || viewIsChildOfDeepestRoute(view, tree))) {
        return
      }

      await fireBeforeMountEvent(view, abort)
    }
  })

  !!properties && tasks.push({
    name: 'Apply Properties',
    callback: () => bind('properties', view, properties, ...args, setProperty)
  })

  !!attributes && tasks.push({
    name: 'Apply Attributes',
    callback: () => bind('attributes', view, attributes, ...args, setAttribute)
  })

  !!listeners && tasks.push({
    name: 'Apply Listeners',
    callback: () => bindListeners(view, listeners, ...args)
  })

  !!bindings && tasks.push({
    name: 'Process Bindings',
    callback: () => processBindings(view, fragment, bindings, retainFormatting)
  })

  !!templates && Object.keys(templates).forEach(id => {
    tasks.push(...getTemplateRenderingTasks(view, templates[id], fragment.getElementById(id)))
  })

  if (viewConfig) {
    if (viewConfig instanceof DataBindingInterpolation) {
      tasks.push({
        name: 'Process View Binding',
        callback: () => {
          const binding = registerViewBinding(view, node, viewConfig)
          binding.reconcile()
        }
      })
    } else {
      tasks.push(...getViewRenderingTasks({
        parent: view,
        rootNode: node,
        config: viewConfig
      }))
    }
  }

  tasks.push(!!placeholder ? {
    name: 'Replace Placeholder',
    callback: () => placeholder.replaceWith(fragment)
  } : {
    name: `Mount View`,

    callback: async (abort) => {
      if (PATH.remaining.length > 0) {
        if (view === tree.deepestRoute) {
          return await replaceView(view, NotFound, abort, tree)
        }
  
        if (viewIsChildOfDeepestRoute(view, tree)) {
          return
        }
      }

      if (!!view.permissions) {
        if (!Session.user) {
          return replaceView(view, Unauthorized, abort, tree)
        }
  
        if (!view.isAccessibleTo(...Session.user.roles)) {
          return await replaceView(view, Forbidden, abort, tree)
        }
      }

      await mountView(view, fragment)
    }
  })

  return tasks
}

export function getViewRenderingTasks ({ parent = null, rootNode, config, route = null }, { rootLevel = false, setDeepestRoute = false } = {}, tree = {}) {
  const view = new View(parent, rootNode, config, route)
  const { routes } = config

  if (routes) {
    const { matched } = new RouteManager(routes)
    tree.deepestRoute = view

    if (matched) {
      return getViewRenderingTasks({
        parent,
        rootNode,
        config: matched.config,
        route: new Route(matched)
      }, { rootLevel, setDeepestRoute: true }, tree)
    }
  }

  if (rootLevel) {
    tree.rootView = view
  }

  if (setDeepestRoute) {
    tree.deepestRoute = view
  }

  parent?.children.push(view)
  const template = config.render?.call(view)
  return getTemplateRenderingTasks(view, template ?? html``, null, tree)
}

export async function unmountView (view) {
  for (let child of view.children) {
    await unmountView(child)
  }

  await view.emit(INTERNAL_ACCESS_KEY, 'unmount')
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

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

async function replaceView (view, config, abort, tree) {
  const setRoot = view === tree.rootView
  view = new View(view.parent, view.rootNode, config, new Route({ url: new URL(PATH.current, PATH.base) }))
  
  await fireBeforeMountEvent(view, abort)
  view.parent?.children.push(view)

  if (setRoot) {
    tree.rootView = view
  }

  return await mountView(view, parseHTML(config.render?.call(view) ?? html``).fragment)
}

async function mountView (view, fragment) {
  view.rootNode.replaceChildren(fragment)
  await view.emit(INTERNAL_ACCESS_KEY, 'mount')
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

function viewIsChildOfDeepestRoute (view, tree) {
  if (!view) {
    return false
  }

  return view.parent === tree.deepestRoute || viewIsChildOfDeepestRoute(view.parent, tree)
}