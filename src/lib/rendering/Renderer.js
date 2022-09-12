import View from '../../View'
import RouteManager from '../routing/RouteManager'
import Route from '../routing/Route'
import { parseHTML } from './HTMLParser'
import { removeEventsByView } from '../events/Bus'
import { addDOMEventHandler, removeDOMEventsByView } from '../events/DOMBus'
import { html } from '../templates/tags'
import { TREE, INTERNAL_ACCESS_KEY } from '../../env';

export function processBindings (view, fragment, bindings) {
  console.log('WIP: Process Bindings');
  Object.keys(bindings).forEach(id => {
    console.log(bindings[id]);
    // const binding = registerContentBinding(parent, fragment.getElementById(id), bindings[id], retainFormatting, renderTemplate)
    // binding.reconcile()
  })
}

export function processTemplate (parent, { attributes, listeners, properties, viewConfig }) {
  const parsed = parseHTML(arguments[1], parent?.rootNode.tagName === 'PRE' ?? false)
  const { fragment } = parsed
  const rootNode = fragment.firstElementChild

  if (!rootNode) {
    return fragment
  }

  const hasMultipleRoots = fragment.children.length > 1
  const args = [rootNode, hasMultipleRoots]

  !!attributes && bind('attributes', parent, attributes, ...args, setAttribute)
  !!properties && bind('properties', parent, properties, ...args, setProperty)
  !!listeners && bindListeners(parent, listeners, ...args)

  if (viewConfig) {
    parent.children.push(renderView(parent, rootNode, viewConfig))
    return fragment
  }

  const { bindings, templates } = parsed

  bindings && processBindings(parent, fragment, bindings)
  templates && processTemplates(parent, fragment, templates)

  return fragment
}

export function processTemplates (view, fragment, templates) {
  Object.keys(templates).forEach(id => {
    const placeholder = fragment.getElementById(id)
    placeholder.replaceWith(processTemplate(view, templates[id]))
  })
}

export function renderView (parent, rootNode, config) {
  const meta = initializeView(...arguments)

  const result = {
    view: meta.view,
    mounted: false
  }

  if (meta.shouldMount) {
    mount(meta)
    result.mounted = true
  }

  return result
}

export function unmount (view) {
  view.children.forEach(({ mounted, view }) => mounted && unmount(view))
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  removeDOMEventsByView(view)
  removeEventsByView(view)
  // removeBindingsByView(view)
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

function initializeView (parent, rootNode, { routes, render }, route = null, markAsLowestChild = false) {
  const result = {
    view: new View(...arguments),
    shouldMount: true
  }

  let retry = false

  result.view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
    abort: () => result.shouldMount = false
  })

  if (!result.shouldMount) {
    result.view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
      retry: () => retry = true,
      resume: () => result.shouldMount = true
    })

    return retry ? initializeView(...arguments) : result
  }

  if (routes) {
    const { matched } = new RouteManager(routes)
    TREE.lowestChild = result.view

    if (matched) {
      return initializeView(parent, rootNode, matched.config, new Route(matched))
    }
  }

  return {
    ...result,
    ...parseHTML(render ? render.call(this.view) : html``, rootNode.tagName === 'PRE')
  }
}

function mount ({ view, fragment, templates, bindings }) {
  console.log('RENDER ', view.name)

  templates && processTemplates(view, fragment, templates)
  bindings && processBindings(view, fragment, bindings)

  view.rootNode.replaceChildren(fragment)
  view.emit(INTERNAL_ACCESS_KEY, 'mount')
}

function processBinding () {

}

function setAttribute (view, node, name, value) {
  // if (value instanceof DataBindingInterpolation) {
  //   const binding = registerAttributeBinding(view, node, name, value)
  //   return binding.reconcile()
  // }

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
  // if (value instanceof DataBindingInterpolation) {
  //   const binding = registerPropertyBinding(view, node, name, value)
  //   return binding.reconcile()
  // }

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