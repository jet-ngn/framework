import View from '../../View'
import RouteManager from '../routing/RouteManager'
import Route from '../routing/Route'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import AttributeList from './AttributeList'

import { parseHTML } from './HTMLParser'
import { addDOMEventHandler, removeDOMEventsByView } from '../events/DOMBus'
import { removeEventsByView } from '../events/Bus'
import { removeBindingsByView } from '../data/DatasetRegistry'
import { html } from './tags'
import { TREE, INTERNAL_ACCESS_KEY, RENDERER } from '../../env';

import {
  registerContentBinding,
  registerAttributeBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../data/DatasetRegistry'

export function generateRenderingTasks (parentView, rootNode, { render, routes }, route = null, setLowestChild = false) {
  const view = new View(...arguments)

  if (routes) {
    const { matched } = new RouteManager(routes)
    TREE.lowestChild = view
    
    if (matched) {
      return generateRenderingTasks(parentView, rootNode, matched.config, new Route(matched))
    }
  }

  if (setLowestChild) {
    TREE.lowestChild = view
  }

  processTemplate(view, rootNode, render?.call(view) ?? html``)
  return view
}

export function generateRenderingTask (view, node, fragment, replace = false) {
  return {
    view,

    callback: () => {
      // console.log('FOR VIEW', view)

      // if (replace) {
      //   console.log('REPLACE', node.cloneNode(true))
      //   console.log('WITH', fragment.cloneNode(true))
      // } else {
      //   console.log('RENDER', fragment.cloneNode(true))
      //   console.log('TO', node.cloneNode(true));
      // }

      const { parent } = view

      if (parent && !parent.children.includes(view)) {
        parent.children.push(view)
      }
      
      replace ? node.replaceWith(fragment) : node.replaceChildren(fragment)
    }
  }
}

export function processBindings (view, fragment, bindings, retainFormatting) {
  Object.keys(bindings).forEach(id => {
    const binding = registerContentBinding(parent, fragment.getElementById(id), bindings[id], retainFormatting)
    binding.reconcile()
  })
}

export function processTemplate (view, rootNode, config, { replace = false, tasks = RENDERER.tasks } = {}) {
  const retainFormatting = rootNode.tagName === 'PRE' ?? false
  const parsed = parseHTML(config, retainFormatting)
  const { fragment } = parsed
  const firstNode = fragment.firstElementChild

  if (!firstNode) {
    return tasks.push(generateRenderingTask(view, rootNode, fragment, replace))
  }

  const { attributes, listeners, properties, viewConfig } = config
  const hasMultipleRoots = fragment.children.length > 1
  const args = [firstNode, hasMultipleRoots]

  !!attributes && bind('attributes', view, attributes, ...args, setAttribute)
  !!properties && bind('properties', view, properties, ...args, setProperty)
  !!listeners && bindListeners(view, listeners, ...args)

  tasks.push(generateRenderingTask(view, rootNode, fragment, replace))

  if (!viewConfig) {
    const { bindings, templates } = parsed
    bindings && processBindings(view, fragment, bindings, retainFormatting)
    return templates && Object.keys(templates).forEach(id => processTemplate(view, fragment.getElementById(id), templates[id], { replace: true, tasks }))
  }

  if (viewConfig instanceof DataBindingInterpolation) {
    const binding = registerViewBinding(view, firstNode, viewConfig)
    return binding.reconcile()
  }
  
  return generateRenderingTasks(view, firstNode, viewConfig)
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