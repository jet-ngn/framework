import View from '../View'
import Route from '../Route'
import Router from '../Router'
import Session from '../Session'
import { removeBindingsByView } from '../registries/DatasetRegistry'
import { removeEventsByView } from '../registries/EventRegistry'
import AttributeList from '../AttributeList'
import DataBindingInterpolation from '../DataBindingInterpolation'
import { addDOMEventHandler, removeDOMEventsByView } from '../registries/DOMEventRegistry'
import { parse } from './ParseUtils'
import { INTERNAL_ACCESS_KEY, TREE } from '../env'

import {
  registerAttributeBinding,
  registerContentBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../registries/DatasetRegistry'

export function generateTree (entity, { permissions, routes = {} }, abort) {
  let start = {
    lowestLevel: TREE.lowestLevel,
    lowestChild: TREE.lowestChild
  }
  
  const router = new Router(routes)
  let { route, vars } = router.getMatchingRoute()

  if (route) {
    return renderRoute(entity, router, route, vars, abort)
  }

  TREE.lowestLevel = start.lowestLevel
  TREE.lowestChild = start.lowestChild
  
  // if (permissions) {
  //   if (!Session.user) {
  //     return '401'
  //   }

  //   const matchingRoles = Object.keys(permissions ?? {}).filter(role => Session.user.roles.includes(role))

  //   if (matchingRoles.length === 0) {
  //     return '401'
  //   }
  // }

  console.log('RENDER ', entity.name)
  const template = arguments[1].render?.call(entity) ?? null
  return template ? renderTemplate(entity, template, false, abort) : ''
}

export function mount (view) {
  // let abort = false

  // view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
  //   abort: () => abort = true
  // })

  // if (abort) {
  //   return
  // }

  view.children.forEach(mount)
  console.log('MOUNT ', view.name)
  view.emit(INTERNAL_ACCESS_KEY, 'mount')
}

export function unmount (view) {
  view.children.forEach(unmount)
  console.log('UNMOUNT ', view.name)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  removeDOMEventsByView(view)
  removeEventsByView(view)
  removeBindingsByView(view)
}

function bindListeners (view, listeners, root, hasMultipleRoots) {
  validateBinding('listeners', root, hasMultipleRoots, () => {
    for (let evt in listeners ?? {}) {
      listeners[evt].forEach(({ handler, cfg }) => addDOMEventHandler(view, root, evt, handler, cfg))
    }
  })
}

function bind (type, view, collection, root, hasMultipleRoots, cb) {
  validateBinding(type, root, hasMultipleRoots, () => {
    for (let item in collection ?? {}) {
      cb(view, root, item, collection[item])
    }
  })
}

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

export function renderTemplate (parent, template, shouldMount = false, abort) {
  if (template.type === 'svg') {
    return renderSVG(template)
  }

  const retainFormatting = parent.root.tagName === 'PRE'
  const parsed = parse(template, retainFormatting)
  const { fragment } = parsed
  const root = fragment.firstElementChild

  if (!root) {
    return fragment
  }

  const hasMultipleRoots = fragment.children.length > 1
  const { attributes, listeners, properties, viewConfig } = template
  const args = [root, hasMultipleRoots]

  !!attributes && bind('attributes', parent, attributes, ...args, setAttribute)
  !!properties && bind('properties', parent, properties, ...args, setProperty)
  !!listeners && bindListeners(parent, listeners, ...args)

  if (viewConfig) {
    TREE.lowestLevel++

    if (viewConfig instanceof DataBindingInterpolation) {
      const binding = registerViewBinding(parent, root, viewConfig, View, mount, unmount, generateTree)
      binding.reconcile()
    } else {
      const view = new View(parent, root, viewConfig)
      parent.children.push(view)
      TREE.lowestChild = view
      console.log('BEFORE MOUNT ', view.name)

      view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
        abort: () => {
          console.log('ABORT MOUNTING ', view.name)
          abort = true
        }
      })

      root.replaceChildren(generateTree(view, viewConfig, abort))
      shouldMount && mount(view)
    }

  } else {
    const { bindings, templates } = parsed

    Object.keys(bindings ?? {}).forEach(id => {
      const binding = registerContentBinding(parent, fragment.getElementById(id), bindings[id], retainFormatting, renderTemplate)
      binding.reconcile()
    })

    Object.keys(templates ?? {}).forEach(id => {
      const placeholder = fragment.getElementById(id)
      placeholder.replaceWith(renderTemplate(parent, templates[id]))
    })
  }

  return abort ? '' : fragment
}

function renderRoute (parent, router, route, vars, abort) {
  const { config } = route
  route = new Route({ url: route.url, vars })
  
  const view = new View(parent, parent.root, config, route)
  parent.children.push(view)

  // TASKS.push(() => {
  //   parent.emit(INTERNAL_ACCESS_KEY, 'route.change', {
  //     previous: ROUTE.previous,
  //     current: ROUTE.current,
  //     view
  //   })
  // })
  console.log('BEFORE MOUNT ', view.name);

  view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
    abort: () => {
      console.log('ABORT MOUNTING ', view.name)
      abort = true
    }
  })

  return generateTree(view, config, abort)
}

function renderSVG (template) {
  const parsed = parse(template, false)
  return parsed.fragment
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