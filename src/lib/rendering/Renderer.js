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

import {
  registerContentBinding,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../data/DatasetRegistry'
import Template from './Template'

export function getViewRenderingTasks (view) {
  const { config } = view
  const { routes } = config

  if (routes) {
    const { matched } = new RouteManager(routes)
    TREE.lowestChild = view

    if (matched) {
      return getViewRenderingTasks(new View(view.parent, view.rootNode, matched.config, new Route(matched)))
    }
  }

  view.parent?.children.push(view)

  const template = config.render?.call(view)
  return template ? getTemplateRenderingTasks(view, template) : []
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

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

function getTemplateRenderingTasks (view, template, placeholder = null) {
  const tasks = []
  const { fragment, bindings, templates } = parseHTML(template, view.rootNode.tagName === 'PRE')
  const { attributes, properties, listeners, viewConfig } = template
  const node = fragment.firstElementChild
  const hasMultipleNodes = fragment.children.length > 1
  const args = [node, hasMultipleNodes]

  if (!!properties) {
    tasks.push({
      name: 'Apply Properties',
      callback: () => bind('properties', view, properties, ...args, setProperty)
    })
  }

  if (!!attributes) {
    tasks.push({
      name: 'Apply Attributes',
      callback: () => bind('attributes', view, attributes, ...args, setAttribute)
    })
  }

  if (!!listeners) {
    tasks.push({
      name: 'Apply Listeners',
      callback: () => bindListeners(view, listeners, ...args)
    })
  }

  if (!!bindings) {
    tasks.push({
      name: 'Process Bindings',
      callback: () => console.log('TODO: PROCESS BINDINGS')
    })
  }

  if (!!templates) {
    Object.keys(templates).forEach(id => {
      tasks.push(...getTemplateRenderingTasks(view, templates[id], fragment.getElementById(id)))
    })
  }

  if (!!viewConfig) {
    tasks.push(...getViewRenderingTasks(new View(view, node, viewConfig)))
  }

  tasks.push(!!placeholder ? {
    name: 'Replace Placeholder',
    callback: () => placeholder.replaceWith(fragment)
  } : {
    name: 'Mount View',

    callback: () => {
      if (view === TREE.lowestChild && PATH.remaining.length > 0) {
        view = new View(view.parent, view.rootNode, NotFound, new Route({ url: new URL(PATH.current, PATH.base) }))
        return mountView(view, parseHTML(NotFound.render.call(view)).fragment)
      }

      mountView(view, fragment)
    }
  })

  return tasks
}

function mountView (view, fragment) {
  let stop = false

  view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
    abort: () => {
      stop = true

      view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
        resume: () => stop = false,
        retry: () => mountView(...arguments)
      })
    }
  })

  if (!stop) {
    if (!!view.permissions) {
      if (!Session.user) {
        view = new View(view.parent, view.rootNode, Unauthorized, new Route({ url: new URL(PATH.current, PATH.base) }))
        return mountView(view, parseHTML(Unauthorized.render.call(view)).fragment)
      }

      if (!view.permissions.hasRole(...Session.user.roles)) {
        view = new View(view.parent, view.rootNode, Forbidden, new Route({ url: new URL(PATH.current, PATH.base) }))
        return mountView(view, parseHTML(Forbidden.render.call(view)).fragment)
      }
    }

    view.rootNode.replaceChildren(fragment)
    view.emit(INTERNAL_ACCESS_KEY, 'mount')
  }
}

function processBindings (view, fragment, bindings, retainFormatting) {
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










// export function generateRenderingTasks (tasks, parentView, rootNode, config, route = null, setLowestChild = false) {
//   const view = new View(parentView, rootNode, config)
//   const { render, routes } = config

//   if (routes) {
//     const { matched } = new RouteManager(routes)
//     TREE.lowestChild = view
    
//     if (matched) {
//       return generateRenderingTasks(tasks, parentView, rootNode, matched.config, new Route(matched))
//     }
//   }

//   if (setLowestChild) {
//     TREE.lowestChild = view
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

