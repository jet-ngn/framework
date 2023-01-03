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

  !!properties && bind('properties', app, parentView, properties, ...args, setProperty)
  !!attributes && bind('attributes', app, parentView, attributes, ...args, setAttribute)
  !!listeners && bindListeners(parentView, listeners, ...args)

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

async function processChildView (app, parent, childViews, { element, config }, { tasks }, routers) {
  if (config instanceof DataBindingInterpolation) {
    return await registerViewBinding(app, parent, childViews, element, config, routers).reconcile()
  }

  await mountView(app, ...app.tree.addChildView(childViews, { parent, element, config }), { tasks }, routers)
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
  if (typeof cfg === 'object') {
    return Object.keys(cfg).forEach(slug => setAttribute(app, view, element, `${name}-${slug}`, cfg[slug]))
  }

  setAttribute(app, view, element, `${name}-${slug}`, cfg)
}

function setProperty (app, view, element, name, value) {
  if (value instanceof DataBindingInterpolation) {
    return registerPropertyBinding(app, view, element, name, value).reconcile()
  }

  element[name] = value
}

function validateBinding (item, element, hasMultipleRoots, cb) {
  if (!element) {
    throw new Error(`Cannot bind ${item} to non-element nodes`)
  }

  if (hasMultipleRoots) {
    throw new Error(`Cannot bind ${item} to more than one node`)
  }

  cb()
}












// export function getViewRoutingTasks (view, options) {
//   const match = getMatchingRoute(view.config.routes)

//   if (match) {
//     !STACK.includes(view) && STACK.push(view)

//     const tasks = getViewInitializationTasks({
//       parent: view,
//       rootNode: view.rootNode,
//       config: match.config,
//       route: new Route(view.parent, match)
//     }, { setDeepestRoute: true, addToTree: true })

//     if (!view.mounted) {
//       tasks.unshift({
//         name: `Fire "${view.name}" beforeMount event`,
//         meta: { view },
  
//         callback: async abort => await fireBeforeMountEvent(view, abort)
//       })

//       tasks.push({
//         name: `Mount "${view.name}"`,
//         callback: async () => !view.mounted && await view.emit(INTERNAL_ACCESS_KEY, 'mount')
//       })
//     }

//     return tasks
//   }

//   // If no route matches, render view template (if one exists)
//   return getViewRenderingTasks(...arguments)
// }

// export function getViewRenderingTasks (view, { setDeepestRoute = false, addToTree = false } = {}) {
//   if (setDeepestRoute) {
//     APP.deepestRoute = view
//   }

//   !!addToTree && !STACK.includes(view) && STACK.push(view)
  
//   return getTemplateRenderingTasks({
//     view,
//     template: view.config.render?.call(view) ?? html``
//   })
// }

// export function getViewInitializationTasks ({ parent = null, rootNode, config, route = null }, { init = null } = {}) {
//   const view = new View(parent, rootNode, config, route)

//   !!init && init(view)

//   if (!!parent) {
//     !parent.children.has(view) && parent.children.add(view)
//   } else {
//     APP.rootView = view
//   }

//   const options = arguments[1]
//   return view.hasRoutes ? getViewRoutingTasks(view, options) : getViewRenderingTasks(view, options)
// }

// export function getTemplateRenderingTasks ({ view, template, placeholder = null } = {}) {
//   const tasks = [],
//         { name } = view,
//         retainFormatting = view.rootNode.tagName === 'PRE',
//         { fragment, bindings, templates } = parseHTML(template, retainFormatting),
//         { attributes, properties, listeners, viewConfig } = template,
//         node = fragment.firstElementChild,
//         hasMultipleNodes = fragment.children.length > 1,
//         args = [node, hasMultipleNodes]

//   !placeholder && !view.mounted && tasks.push({
//     name: `Fire "${name}" beforeMount event`,
//     meta: { view },

//     callback: async (abort) => {
//       if (PATH.remaining.length > 0 && (view === APP.deepestRoute || viewIsChildOfDeepestRoute(view))) {
//         return
//       }

//       await fireBeforeMountEvent(view, abort)
//     }
//   })

//   !!properties && tasks.push({
//     name: `Apply properties to "${name}" rootNode`,
//     meta: { view, node, properties },
//     callback: () => bind('properties', view, properties, ...args, setProperty)
//   })

//   !!attributes && tasks.push({
//     name: `Apply attributes to "${name}" rootNode or child node`,
//     meta: { view, node, attributes },
//     callback: () => bind('attributes', view, attributes, ...args, setAttribute)
//   })

//   !!listeners && tasks.push({
//     name: `Apply listeners to "${name}" rootNode or child node`,
//     meta: { view, node, listeners },
//     callback: () => bindListeners(view, listeners, ...args)
//   })

//   !!bindings && tasks.push({
//     name: `Process "${name}" Bindings`,
//     meta: { view, fragment, bindings, retainFormatting },
//     callback: () => processBindings(view, fragment, bindings, retainFormatting)
//   })

//   !!templates && Object.keys(templates).forEach(id => {
//     tasks.push(...getTemplateRenderingTasks({
//       view,
//       template: templates[id],
//       placeholder: fragment.getElementById(id)
//     }))
//   })

//   if (viewConfig) {
//     if (viewConfig instanceof DataBindingInterpolation) {
//       tasks.push({
//         name: `Bind ${viewConfig.name ? `"${viewConfig.name}" as` : ''} child view to "${name}"`,
//         meta: { view, config: viewConfig },

//         callback: () => {
//           const binding = registerViewBinding(view, node, viewConfig)
//           return binding.reconcile()
//         }
//       })
//     } else {
//       tasks.push(...getViewInitializationTasks({
//         parent: view,
//         rootNode: node,
//         config: viewConfig
//       }))
//     }
//   }

//   if (!!placeholder) {
//     return [...tasks, {
//       name: `Replace "${name}" placeholder "${placeholder.id}" template`,
//       meta: { view, placeholder, fragment },
//       callback: () => placeholder.replaceWith(fragment)
//     }]
//   }

//   return [...tasks, {
//     name: `Render "${name}"`,
//     callback: async abort => await renderView(view, fragment, abort)
//   }, {
//     name: `Mount "${name}"`,
//     meta: { view },
//     callback: async () => !view.mounted && await view.emit(INTERNAL_ACCESS_KEY, 'mount')
//   }]
// }

// export async function renderView (view, fragment, abort) {
//   if (PATH.remaining.length > 0) {
//     if (view === APP.deepestRoute) {
//       return await replaceView(view, NotFound, abort)
//     }

//     if (viewIsChildOfDeepestRoute(view)) {
//       return
//     }
//   }

//   if (!!view.permissions) {
//     if (!Session.user) {
//       return replaceView(view, Unauthorized, abort)
//     }

//     if (!view.isAccessibleTo(...Session.user.roles)) {
//       return await replaceView(view, Forbidden, abort)
//     }
//   }

//   view.rootNode.replaceChildren(fragment)
// }

// export async function unmountView (view) {
//   for (let child of view.children) {
//     await unmountView(child)
//   }

//   const { parent } = view

//   if (!!parent) {
//     parent.children.delete(view)
//   }

//   await view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  
//   removeDOMEventsByNode(view.rootNode)
//   removeEventsByView(view)
//   removeBindingsByView(view)
// }

// function bind (type, view, collection, root, hasMultipleRoots, cb) {
//   validateBinding(type, root, hasMultipleRoots, () => {
//     for (let item in collection ?? {}) {
//       cb(view, root, item, collection[item])
//     }
//   })
// }

// function bindListeners (view, listeners, root, hasMultipleRoots) {
//   validateBinding('listeners', root, hasMultipleRoots, () => {
//     for (let evt in listeners ?? {}) {
//       listeners[evt].forEach(({ handler, cfg }) => addDOMEventHandler(view, root, evt, handler, cfg))
//     }
//   })
// }

// async function fireBeforeMountEvent (view, abort) {
//   let stop = false

//   await view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
//     abort: async () => {
//       stop = true

//       await view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
//         resume: () => stop = false,

//         retry: async () => {
//           stop = false
//           await fireBeforeMountEvent(...arguments)
//         }
//       })
//     }
//   })

//   stop && abort()
// }

// function getExistingAttributeValue (node, name) {
//   const value = node.getAttribute(name)
//   return value ? value.trim().split(' ').map(item => item.trim()) : []
// }

// async function replaceView (view, config, abort) {
//   const isRoot = view === APP.rootView
//   view = new View(view.parent, view.rootNode, config, new Route(view.parent, { url: new URL(PATH.current, PATH.base) }))
  
//   await fireBeforeMountEvent(view, abort)

//   const { parent } = view

//   if (!!parent) {
//     !parent.children.has(view) && parent.children.add(view)
//   }

//   if (isRoot) {
//     APP.rootView = view
//   }

//   view.rootNode.replaceChildren(parseHTML(config.render?.call(view) ?? html``).fragment)
//   return await view.emit(INTERNAL_ACCESS_KEY, 'mount')
// }

// function processBindings (view, fragment, bindings, retainFormatting) {
//   Object.keys(bindings).forEach(id => {
//     const binding = registerContentBinding(view, fragment.getElementById(id), bindings[id], retainFormatting)
//     binding.reconcile()
//   })
// }

// function setAttribute (view, node, name, value) {
//   if (value instanceof DataBindingInterpolation) {
//     const binding = registerAttributeBinding(view, node, name, value)
//     return binding.reconcile()
//   }

//   const existing = getExistingAttributeValue(node, name)

//   if (Array.isArray(value)) {
//     const list = new AttributeList(view, node, name, [...(existing ?? []), ...value])
//     return node.setAttribute(name, list.value)
//   }

//   switch (typeof value) {
//     case 'string':
//     case 'number': return node.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
//     case 'boolean': return value && node.setAttribute(name, '')
//     case 'object': return setNamespacedAttribute(view, node, name, value)

//     default: throw new TypeError(`"${view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
//   }
// }

// function setNamespacedAttribute (view, node, name, cfg) {
//   if (typeof cfg === 'object') {
//     return Object.keys(cfg).forEach(slug => setAttribute(view, node, `${name}-${slug}`, cfg[slug]))
//   }

//   setAttribute(view, node, `${name}-${slug}`, cfg)
// }

// function setProperty (view, node, name, value) {
//   if (value instanceof DataBindingInterpolation) {
//     const binding = registerPropertyBinding(view, node, name, value)
//     return binding.reconcile()
//   }

//   node[name] = value
// }

// function validateBinding (item, node, hasMultipleRoots, cb) {
//   if (!node) {
//     throw new Error(`Cannot bind ${item} to non-element nodes`)
//   }

//   if (hasMultipleRoots) {
//     throw new Error(`Cannot bind ${item} to more than one node`)
//   }

//   cb()
// }

// function viewIsChildOfDeepestRoute (view) {
//   if (!view) {
//     return false
//   }

//   return view.parent === APP.deepestRoute || viewIsChildOfDeepestRoute(view.parent)
// }