import View from '../View'
import Route from '../Route'
import Router from '../Router'
import EventRegistry from '../registries/EventRegistry'
import AttributeList from '../AttributeList'
import DataBindingInterpolation from '../DataBindingInterpolation'
import { removeDOMEventsByView } from '../registries/DOMEventRegistry'
import { addDOMEventHandler } from '../registries/DOMEventRegistry'
import { parse } from './ParseUtils'
import { getNeededScore } from './RouteUtils'
import { INTERNAL_ACCESS_KEY, PATH } from '../env'

import {
  registerAttributeBinding,
  registerContentBinding,
  registerPropertyBinding,
  registerViewBinding
} from '../registries/DataSetRegistry'

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

export function generateChildren (parent, { routes }) {
  const template = Reflect.get(arguments[1], 'template', parent)
  const neededScore = getNeededScore(PATH.remaining)
  const templateResult = template ? parseTemplate(parent, template) : null

  if (neededScore === 0 || templateResult?.score === neededScore) {
    parent.children.push(...templateResult.children)
    return templateResult
  }

  const routerResult = parseRoutes(parent, new Router(parent, routes))
  
  const winner = [templateResult, routerResult].reduce((result, entry) => {
    return entry.score > (result?.score ?? 0) ? entry : result
  }, null)

  if (winner) {
    parent.children.push(...winner.children)
    return winner
  }

  return {
    fragment: '404',
    children: [],
    score: 0
  }
}

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

function parseRoutes (parent, router) {
  const result = {
    children: [],
    fragment: '404',
    score: 0
  }

  const match = router.getMatchingRoute(result)
  
  if (match) {
    const { config } = match
    const view = new View(parent, parent.root, config, new Route(match))
    const data = generateChildren(view, config)
    view.children.push(...data.children)
    result.children.push(view)
    result.score += data.score
    result.fragment = data.fragment
  }

  return result
}

export function parseTemplate (parent, template) {
  const result = {
    children: [],
    fragment: null,
    score: 0
  }

  const retainFormatting = parent.root.tagName === 'PRE'
  const { fragment, bindings, templates } = parse(template, retainFormatting)
  const root = fragment.firstElementChild

  result.fragment = fragment
  
  if (!root) {
    return result
  }

  const hasMultipleRoots = fragment.children.length > 1
  const { attributes, listeners, properties, viewConfig } = template
  const args = [root, hasMultipleRoots]

  !!attributes && bind('attributes', parent, attributes, ...args, setAttribute)
  !!properties && bind('properties', parent, properties, ...args, setProperty)
  !!listeners && bindListeners(parent, listeners, ...args)

  if (viewConfig) {
    if (viewConfig instanceof DataBindingInterpolation) {
      const binding = registerViewBinding(parent, root, viewConfig, retainFormatting)
      result.children.push(...binding.reconcile())

    } else {
      const view = new View(parent, root, viewConfig)
      const data = generateChildren(view, viewConfig)

      view.children.push(...data.children)
      result.children.push(view)
      result.score += data.score
      root.replaceChildren(data.fragment)
    }
    
  } else {
    Object.keys(bindings ?? {}).forEach(id => {
      const binding = registerContentBinding(parent, fragment.getElementById(id), bindings[id], retainFormatting)
      result.children.push(...binding.reconcile())
    })

    Object.keys(templates ?? {}).forEach(id => {
      const parsed = parseTemplate(parent, templates[id])
      result.children.push(...parsed.children)
      result.score += parsed.score
      fragment.getElementById(id).replaceWith(parsed.fragment)
    })
  }

  return result
}

export function mount (view) {
  view.children.forEach(mount)
  view.emit(INTERNAL_ACCESS_KEY, 'mount')
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

export function unmount (view) {
  view.children.forEach(unmount)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  removeDOMEventsByView(view)
  EventRegistry.removeByView(view)
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