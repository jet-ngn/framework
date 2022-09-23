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
import { addDOMEventHandler, removeDOMEventsByView } from '../events/DOMBus'
import { removeEventsByView } from '../events/Bus'
import { removeBindingsByView } from '../data/DatasetRegistry'
import { TREE, INTERNAL_ACCESS_KEY, PATH } from '../../env';
import { html } from './tags'

import {
  registerContentBinding,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../data/DatasetRegistry'

export function getViewRenderingTasks ({ parent = null, rootNode, config, route = null }, { rootLevel = false, setDeepestRoute = false } = {}) {
  const view = new View(parent, rootNode, config, route)

  if (rootLevel) {
    TREE.rootView = view
  }

  if (setDeepestRoute) {
    TREE.deepestRoute = view
  }

  const { routes } = config

  if (routes) {
    const { matched } = new RouteManager(routes)
    TREE.deepestRoute = view

    if (matched) {
      return getViewRenderingTasks({
        parent,
        rootNode,
        config: matched.config,
        route: new Route(matched)
      }, { rootLevel, setDeepestRoute: true })
    }
  }

  parent?.children.push(view)
  const template = config.render?.call(view)
  return getTemplateRenderingTasks(view, template ?? html``)
}

export function unmountView (view) {
  view.children.forEach(unmountView)
  removeDOMEventsByView(view)
  removeBindingsByView(view)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  removeEventsByView(view)
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

function fireBeforeMountEvent (view, abort) {
  let stop = false

  view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
    abort: () => {
      stop = true

      view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
        resume: () => stop = false,

        retry: () => {
          stop = false
          fireBeforeMountEvent(...arguments)
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

function getTemplateRenderingTasks (view, template, placeholder = null) {
  const tasks = []
  const retainFormatting = view.rootNode.tagName === 'PRE'
  const { fragment, bindings, templates } = parseHTML(template, retainFormatting)
  const { attributes, properties, listeners, viewConfig } = template
  const node = fragment.firstElementChild
  const hasMultipleNodes = fragment.children.length > 1
  const args = [node, hasMultipleNodes]

  !placeholder && tasks.push({
    name: 'Fire Before Mount event',

    callback: abort => {
      if (PATH.remaining.length > 0 && (view === TREE.deepestRoute || viewIsChildOfDeepestRoute(view))) {
        return
      }

      fireBeforeMountEvent(view, abort)
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

    callback: abort => {
      if (PATH.remaining.length > 0) {
        if (view === TREE.deepestRoute) {
          return replaceView(view, NotFound, abort)
        }
  
        if (viewIsChildOfDeepestRoute(view)) {
          return
        }
      }

      mountView(view, fragment)
    }
  })

  return tasks
}

function replaceView (view, config, abort) {
  const setRoot = view === TREE.rootView
  view = new View(view.parent, view.rootNode, config, new Route({ url: new URL(PATH.current, PATH.base) }))
  
  fireBeforeMountEvent(view, abort)
  view.parent?.children.push(view)

  if (setRoot) {
    TREE.rootView = view
  }

  return mountView(view, parseHTML(config.render?.call(view) ?? html``).fragment)
}

function mountView (view, fragment, children) {
  view.rootNode.replaceChildren(fragment)
  view.emit(INTERNAL_ACCESS_KEY, 'mount')
}

function processBindings (view, fragment, bindings, retainFormatting) {
  console.log('HEY');
  Object.keys(bindings).forEach(id => {
    const binding = registerContentBinding(parent, fragment.getElementById(id), bindings[id], retainFormatting)
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










// export function generateRenderingTasks (tasks, parentView, rootNode, config, route = null, setLowestChild = false) {
//   const view = new View(parentView, rootNode, config)
//   const { render, routes } = config

//   if (routes) {
//     const { matched } = new RouteManager(routes)
//     TREE.deepestRoute = view
    
//     if (matched) {
//       return generateRenderingTasks(tasks, parentView, rootNode, matched.config, new Route(matched))
//     }
//   }

//   if (setLowestChild) {
//     TREE.deepestRoute = view
//   }

//   processTemplate(tasks, view, rootNode, render?.call(view) ?? html``)
//   return view
// }

// export function generateRenderingTask (view, node, fragment, replace = false) {
//   return {
//     view,

//     log: (number) => {
//       console.log(`${number}) FOR VIEW "${view.name}"`)

//       if (replace) {
//         console.log('REPLACE', node.cloneNode(true))
//         console.log('WITH', fragment.cloneNode(true))
//       } else {
//         console.log('RENDER', fragment.cloneNode(true))
//         console.log('TO', node.cloneNode(true));
//       }

//       console.log('---------------------------');
//     },

//     callback: () => {
//       const { parent } = view

//       if (parent && !parent.children.includes(view)) {
//         parent.children.push(view)
//       }
      
//       replace ? node.replaceWith(fragment) : node.replaceChildren(fragment)
//     }
//   }
// }

// export function processTemplate (tasks, view, rootNode, config, replace = false) {
//   const retainFormatting = rootNode.tagName === 'PRE' ?? false
//   const parsed = parseHTML(config, retainFormatting)
//   const { fragment } = parsed
//   const firstNode = fragment.firstElementChild

//   if (!firstNode) {
//     return tasks.push(generateRenderingTask(view, rootNode, fragment, replace))
//   }

//   const { attributes, listeners, properties, viewConfig } = config
//   const hasMultipleRoots = fragment.children.length > 1
//   const args = [firstNode, hasMultipleRoots]

//   !!attributes && bind('attributes', view, attributes, ...args, setAttribute)
//   !!properties && bind('properties', view, properties, ...args, setProperty)
//   !!listeners && bindListeners(view, listeners, ...args)

//   tasks.push(generateRenderingTask(view, rootNode, fragment, replace))

//   if (!viewConfig) {
//     const { bindings, templates } = parsed
//     bindings && processBindings(view, fragment, bindings, retainFormatting)
//     return templates && Object.keys(templates).forEach(id => processTemplate(tasks, view, fragment.getElementById(id), templates[id], true))
//   }

//   if (viewConfig instanceof DataBindingInterpolation) {
//     return tasks.push({
//       view,

//       log: (number) => {
//         console.log(`${number}) FOR VIEW "${view.name}"`)
  
//         if (replace) {
//           console.log('REPLACE', node.cloneNode(true))
//           console.log('WITH', fragment.cloneNode(true))
//         } else {
//           console.log('RENDER', fragment.cloneNode(true))
//           console.log('TO', node.cloneNode(true));
//         }
//       },

//       callback: () => {
//         const binding = registerViewBinding(view, firstNode, viewConfig)
//         binding.reconcile()
//       }
//     })
//   }
  
//   return generateRenderingTasks(tasks, view, firstNode, viewConfig)
// }

