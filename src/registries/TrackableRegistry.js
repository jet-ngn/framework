import Template from '../Template.js'
import { TrackingInterpolation } from '../Interpolation.js'
import { NANOID } from '@ngnjs/libdata'
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
    if (this.name === 'class') {
      return this.node.classList.replace(this.#currentValue, this.value)      
    }

    this.node.setAttribute(this.name, this.node.getAttribute(this.name).replace(this.#currentValue, this.value))
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

  constructor (node, cfg, parent = null) {
    super(cfg, parent)
    this.#node = node
  }

  reconcile () {
    EntityRegistry.getEntryByNode(this.#node).unmount()
    EntityRegistry.register(this.#node, this.value, this.parent).mount()
  }
}

class ContentTracker extends Tracker {
  #placeholder
  #nodes
  #options

  pop () {
    const last = this.#nodes.at(-1)
    const { unmount } = EntityRegistry.getEntryByNode(last) ?? {}
    
    if (unmount) {
      unmount()
    }

    last.remove()
    this.#nodes.pop()
  }

  push (...args) {
    const newNodes = this.#getNodes(this.value.slice(args.length * -1))
    const last = this.#nodes.at(-1)

    if (!last) {
      this.#placeholder.replaceWith(...newNodes)
      this.#nodes = newNodes
    } else {
      last.after(...newNodes)
      this.#nodes.push(...newNodes)
    }
  }

  render (parent, node, options) {
    this.#placeholder = node
    this.#nodes = [node]
    this.#options = getOptions(options, node)
    this.reconcile()
  }

  shift () {
    const first = this.#nodes[0]
    const { unmount } = EntityRegistry.getEntryByNode(first) ?? {}
    
    if (unmount) {
      unmount()
    }

    first.remove()
    this.#nodes.shift()
  }

  unshift (...args) {
    const newNodes = this.#getNodes(this.value.slice(0, args.length))
    const first = this.#nodes[0]

    if (!first) {
      this.#placeholder.replaceWith(...newNodes)
      this.#nodes = newNodes
    } else {
      first.before(...newNodes)
      this.#nodes.unshift(...newNodes)
    }
  }

  reconcile () {    
    this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(this.value, false))
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      const result = []

      for (let item of value) {
        const output = this.#getNodes(item)
        result.push(...output)
      }

      return result
    }

    if (value instanceof Template) {
      const renderer = new Renderer(this.parent, this.#options)
      return [...renderer.render(value, true).childNodes]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': return [document.createTextNode(sanitizeString(value !== false ? `${value}` : '', this.#options))]
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]

      default: throw new TypeError(`Invalid tracker value type "${typeof value}"`)
    }
  }

  // #replaceWith (nodes) {
  //   for (let i = 1, { length } = this.#nodes; i < length; i++) {
  //     this.#nodes[i].remove()
  //   }
    
  //   this.#nodes.at(0).replaceWith(...nodes)
  //   this.#nodes = nodes
  // }
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

  static registerBindingTracker (node, cfg, parent) {
    return this.#register(new BindingTracker(...arguments))
  }

  static registerContentTracker (cfg, parent) {
    return this.#register(new ContentTracker(...arguments))
  }

  static observe (target) {
    if (Array.isArray(target)) {
      return this.#observeArray(target)
    }

    switch (typeof target) {
      case 'object': return this.#observeObject(target)
      default: throw new TypeError(`Observing "${typeof target}" objects is not currently supported`)
    }
  }

  static track (target, property, transform) {
    return new TrackingInterpolation(...arguments)
  }
  // this.#getArrayProxyHandlers(trackers, changelog)
  static #observeArray (target) {
    const changelog = []
    const trackers = []
    const revocable = Proxy.revocable(target, {
      get: (target, property) => target[property]
    })

    trackables.set(target, {
      revocable,
      trackers,
      changelog
    })

    return revocable.proxy
  }

  // static #updateArrayTrackers (arr, handler, trackers, changelog, callback) {
  //   return (...args) => {
  //     const output = handler.apply(arr, args)

  //     for (let tracker of trackers) {
  //       callback(tracker, args)
  //     }

  //     return output
  //   }
  // }

  // static #getArrayMethodHandler (arr, name, handler, trackers, changelog) {
  //   switch (name) {
  //     case 'pop':
  //     case 'push':
  //     case 'shift':
  //     case 'unshift': return this.#updateArrayTrackers(arr, handler, trackers, changelog, (tracker, args) => tracker[property](...args))

  //     case 'copyWithin':
  //     case 'fill':
  //     case 'reverse':
  //     case 'sort':
  //     case 'splice': return this.#updateArrayTrackers(arr, handler, trackers, changelog, tracker => tracker.reconcile())
    
  //     default: return (...args) => handler.apply(arr, args)
  //   }
  // }

  static #getArrayProxyHandlers (registeredTarget) {
    return {
      get: (target, property) => {
        const method = target[property]
        
        switch (property) {
          case 'pop':
          case 'push':
          case 'shift':
          case 'unshift': return (...args) => {
            const output = method.apply(target, args)

            for (let tracker of registeredTarget.trackers) {
              tracker[property](...args)
            }

            return output
          }

          case 'copyWithin':
          case 'fill':
          case 'reverse':
          case 'sort':
          case 'splice': return (...args) => {
            const output = method.apply(target, args)

            for (let tracker of registeredTarget.trackers) {
              tracker.reconcile()
            }

            return output
          }
        
          default: return (...args) => method.apply(target, args)
        }

        // const currentValue = target
        // const handler = this.#getArrayMethodHandler(target, property, method, trackers, changelog)

        // console.log(currentValue)
        // console.log(handler)
        // console.log();

        // if (!!changelog) {
        //   changelog.push({
        //     timestamp: Date.now(),
        //     action: property,
        //     value: {
        //       old: currentValue,
        //       new: target
        //     }
        //   })
        // }
        
        // return newValue
      }
    }
    
    
    // const changelog = []

    // const callback = (changelog, reconcile = false) => (...args) => {
    //   if (changelog) {
    //     changelog.push({
          
    //     })
    //   }

    //   original.apply(target, args)

    //   for (let tracker of trackers) {
    //     if (!tracker.property && reconcile) {
    //       tracker.reconcile()
    //       continue
    //     }

    //     if (tracker.property === name) {
    //       tracker[property](...args)
    //       continue
    //     }
    //   }
    // }

    // const args = [parent[name], {
    //   get: (target, property) => {
    //     const original = target[property]
    //     const { trackers } = this.getTarget(parent) ?? {}

    //     switch (property) {
    //       case 'pop':
    //       case 'push':
    //       case 'shift':
    //       case 'unshift': return this.#getArrayMethodHandler(original, target, )

    //       case 'copyWithin':
    //       case 'fill':
    //       case 'reverse':
    //       case 'sort':
    //       case 'splice': return callback(true)
        
    //       default: return original
    //     }
    //   }
    // }]

    // if (nested) {
    //   return new Proxy(...args)
    // }

    // const revocable = Proxy.revocable(...args)

    // trackables.set(obj, {
    //   revocable,
    //   trackers: [],
    //   changelog
    // })

    // return revocable.proxy
  }

  static #observeObject (obj) {
    const revocable = Proxy.revocable(obj, {
      get: (target, property) => {
        const value = target[property]

        if (Array.isArray(value)) {
          return new Proxy(value, this.#getArrayProxyHandlers(this.getTarget(target)))
        }

        return value
      },

      set: (target, property, value) => {
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
          tracker.reconcile()
        }

        return true
      }
    })

    trackables.set(obj, { revocable, trackers: [], changelog: [] })
    return revocable.proxy
  }

  static #register (tracker) {
    console.log(tracker);
    const trackable = this.getProxy(tracker.target)

    if (!trackable) {
      throw new Error(`Cannot track untrackable object`)
    }

    console.log(tracker.parent)

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