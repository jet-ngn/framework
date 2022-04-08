import Template from '../Template.js'
import { TrackingInterpolation } from '../Interpolation.js'
import { NANOID, typeOf } from '@ngnjs/libdata'
import { reconcileNodes } from '../Reconciler.js'
import { sanitizeString, stripExtraSpaces } from '../utilities/StringUtils.js'
import Renderer, { getOptions } from '../Renderer.js'
import EntityRegistry from './EntityRegistry.js'

class Tracker {
  #id = NANOID()
  #parent
  #target
  #property
  #transform

  constructor ({ target, property, transform }, parent) {
    this.#parent = parent
    this.#target = target
    this.#property = property
    this.#transform = transform
  }

  get id () {
    return this.#id
  }

  get parent () {
    return this.#parent
  }

  get target () {
    return this.#target
  }

  get property () {
    return this.#property
  }

  get value () {
    return this.#transform(this.#property ? this.#target[this.#property] : this.#target)
  }
}

class AttributeTracker extends Tracker {
  #node
  #name

  constructor (node, name, cfg, parent) {
    super(cfg, parent)
    this.#node = node
    this.#name = name
  }

  get node () {
    return this.#node
  }

  get name () {
    return this.#name
  }

  reconcile () {
    const { value } = this

    if (typeof this.value === 'boolean') {
      return value ? this.#node.setAttribute(this.#name, '') : this.#node.removeAttribute(this.#name)
    }

    this.#node.setAttribute(this.#name, typeof value === 'boolean' ? '' : value)
  }
}

class AttributeListTracker extends AttributeTracker {
  #currentValue

  constructor () {
    super(...arguments)
    this.#currentValue = this.value
  }

  reconcile () {
    const { value } = this

    if (this.name === 'class') {
      this.node.classList.replace(this.#currentValue, value)      
    } else {
      this.node.setAttribute(this.name, this.node.getAttribute(this.name).replace(this.#currentValue, value))
    }

    this.#currentValue = value
  }
}

class BooleanAttributeListTracker extends AttributeTracker {
  #attribute

  constructor (node, name, attribute, cfg, parent) {
    super(node, name, cfg, parent)
    this.#attribute = attribute
  }

  reconcile () {
    const { value } = this
    
    if (this.name === 'class') {
      return value ? this.node.classList.add(this.#attribute) : this.node.classList.remove(this.#attribute)      
    }

    const current = this.node.getAttribute(this.name)
    this.node.setAttribute(this.name, value ? `${current} ${this.#attribute}` : current.replace(this.#attribute, ''))
  }
}

class BindingTracker extends Tracker {
  #node
  #listeners

  constructor (node, cfg, parent = null, listeners) {
    super(cfg, parent)
    this.#node = node
    this.#listeners = listeners
  }

  reconcile () {
    let current = EntityRegistry.getEntryByNode(this.#node)

    current.unmount()
    this.#listeners?.unmount && this.#listeners.unmount.call(current.entity)
    
    let next = EntityRegistry.register(this.#node, this.value, this.parent)

    next.mount()
    this.#listeners?.mount && this.#listeners.mount.call(next.entity)
  }
}

class ContentTracker extends Tracker {
  #placeholder
  nodes
  #options
  #currentValue

  constructor () {
    super(...arguments)
    this.#currentValue = this.value
  }

  get placeholder () {
    return this.#placeholder
  }

  reconcile () {
    if ([this.#currentValue, this.value].every(item => item instanceof Template)) {
      return this.replaceWith(this.getNodes(this.value))
    }

    this.nodes = reconcileNodes(this.nodes, this.getNodes(this.value))
  }

  render (node, options) {
    this.#placeholder = node
    this.nodes = [node]
    this.#options = getOptions(options, node)
    this.reconcile()
  }

  getNodes (value) {
    if (Array.isArray(value)) {
      const result = []

      for (let item of value) {
        const output = this.getNodes(item)
        result.push(...output)
      }

      return result
    }

    if (value instanceof Template) {
      const renderer = new Renderer(this.parent, this.#options)
      const { content, tasks } = renderer.render(value, true)
      tasks.forEach(task => task())
      return [...content.children]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': return [document.createTextNode(sanitizeString(value !== false ? `${value}` : '', this.#options))]
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]

      default: throw new TypeError(`Invalid tracker value type "${typeof value}"`)
    }
  }

  replaceWith (nodes) {
    for (let i = 1, { length } = this.nodes; i < length; i++) {
      this.nodes[i].remove()
    }
    
    this.nodes.at(0).replaceWith(...nodes)
    this.nodes = nodes
  }
}

class ArrayContentTracker extends ContentTracker {
  pop () {
    const last = this.nodes.at(-1)
    const { unmount } = EntityRegistry.getEntryByNode(last) ?? {}
    
    if (unmount) {
      unmount()
    }

    last.remove()
    this.nodes.pop()
  }

  push (...args) {
    const newNodes = this.getNodes(this.value.slice(args.length * -1))
    const last = this.nodes.at(-1)

    if (!last || last === this.placeholder) {
      this.placeholder.replaceWith(...newNodes)
      this.nodes = newNodes
    } else {
      last.after(...newNodes)
      this.nodes.push(...newNodes)
    }
  }

  reconcile () {
    if (this.value.length === 0) {
      return this.replaceWith([this.placeholder])
    }

    super.reconcile()
  }

  shift () {
    const first = this.nodes[0]
    const { unmount } = EntityRegistry.getEntryByNode(first) ?? {}
    
    if (unmount) {
      unmount()
    }

    first.remove()
    this.nodes.shift()
  }

  unshift (...args) {
    const newNodes = this.getNodes(this.value.slice(0, args.length))
    const first = this.nodes[0]

    if (!first || first === this.placeholder) {
      this.placeholder.replaceWith(...newNodes)
      this.nodes = newNodes
    } else {
      first.before(...newNodes)
      this.nodes.unshift(...newNodes)
    }
  }
}

const trackables = new Map

export default class TrackableRegistry {
  static getChanges (proxy) {
    const trackable = this.getProxy(proxy)

    if (!trackable) {
      throw new Error(`Cannot get changelog for non-trackable object`)
    }

    return trackable.changelog
  }

  static getProxy (proxy) {
    return [...trackables.values()].find(({ revocable }) => revocable.proxy === proxy)
  }

  static getTarget (target) {
    return trackables.get(target)
  }

  static has (target) {
    return [...trackables.values()].some(({ proxy }) => proxy === target)
  }

  static registerAttributeTracker (node, name, cfg, parent) {
    return this.#register(new AttributeTracker(...arguments))
  }

  static registerAttributeListTracker (node, name, list, parent) {
    return this.#register(new AttributeListTracker(...arguments))
  }

  static registerBooleanAttributeListTracker (node, name, attr, list, parent) {
    return this.#register(new BooleanAttributeListTracker(...arguments))
  }

  static registerBindingTracker (node, cfg, parent, listeners) {
    return this.#register(new BindingTracker(...arguments))
  }

  static registerContentTracker (cfg, parent) {
    if (Array.isArray(cfg.target)) {
      return this.#register(new ArrayContentTracker(...arguments))
    }

    return this.#register(new ContentTracker(...arguments))
  }

  static observe (target) {
    switch (typeOf(target)) {
      case 'array': return this.#observeArray(target)
      case 'object': return this.#observeObject(target)
      default: throw new TypeError(`Tracking "${typeof target}" objects is not currently supported`)
    }
  }

  static track (target, property, transform) {
    return new TrackingInterpolation(...arguments)
  }

  static #getArrayMethodHandler (target, property, reconcile = false) {
    return (...args) => {
      const method = target[property]

      const change = {
        timestamp: Date.now(),
        action: property,

        value: {
          old: [...target],
          new: null
        }
      }

      const { trackers, changelog } = this.getTarget(target) ?? {}
      const output = method.apply(target, args)

      change.value.new = [...target]
      changelog.push(change)

      for (let tracker of trackers) {
        if (tracker instanceof ArrayContentTracker && !reconcile) {
          tracker[property](...args)
        } else {
          tracker.reconcile()
        }
      }

      return output
    }
  }

  static #observeArray (arr) {
    const revocable = Proxy.revocable(arr, {
      get: (target, property) => {
        switch (property) {
          case 'pop':
          case 'push':
          case 'shift':
          case 'unshift': return this.#getArrayMethodHandler(target, property)

          case 'copyWithin':
          case 'fill':
          case 'reverse':
          case 'sort':
          case 'splice': return this.#getArrayMethodHandler(target, property, true)
        
          default: return target[property]
        }
      },

      set: () => {
        console.log('SET ARRAY');
        // TODO: Add logic here for setting properties like length:
        // arr.length = 0
        // This can clear the array without having to reassign
      }
    })

    trackables.set(arr, { revocable, trackers: [], changelog: [] })
    return revocable.proxy
  }

  static #observeObject (obj) {
    const revocable = Proxy.revocable(obj, {
      get: (target, property) => target[property],

      set: (target, property, value) => {
        const currentValue = target[property]

        if (currentValue === value) {
          return true
        }

        const { trackers, changelog } = this.getTarget(target) ?? {}

        changelog.push({
          timestamp: Date.now(),
          property,
          value: {
            old: target[property],
            new: value
          }
        })

        target[property] = value

        for (let tracker of trackers) {
          tracker.property === property && tracker.reconcile()
        }

        return true
      }
    })

    trackables.set(obj, { revocable, trackers: [], changelog: [] })
    return revocable.proxy
  }

  static #register (tracker) {
    const trackable = this.getProxy(tracker.target)

    if (!trackable) {
      throw new Error(`Cannot track untrackable object`)
    }

    trackable.trackers.push(tracker)
    return tracker
  }
}

export class Trackable {
  constructor (target) {
    return TrackableRegistry.getTarget(target) ?? TrackableRegistry.observe(target)
  }
}

export function getChanges (trackable) {
  return TrackableRegistry.getChanges(trackable)
}

export function track (target, property, transform) {
  return TrackableRegistry.track(...arguments)
}