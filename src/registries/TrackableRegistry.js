import Template from '../Template.js'
import { NANOID } from '@ngnjs/libdata'
import { reconcileNodes } from '../Reconciler.js'
import { sanitizeString } from '../utilities/StringUtils.js'
import Renderer from '../Renderer.js'

export class TrackingInterpolation {
  #target
  #property
  #transform

  constructor (target, property, transform) {
    this.#target = target
    this.#property = property
    this.#transform = transform ?? (value => value)

    if (typeof property === 'function') {
      this.#property = null
      this.#transform = property
    }
  }

  get target () {
    return this.#target
  }

  get property () {
    return this.#property
  }

  get transform () {
    return this.#transform
  }
}

class Tracker {
  #id = NANOID()
  #target
  #property
  #transform

  constructor ({ target, property, transform }) {
    this.#target = target
    this.#property = property
    this.#transform = transform
  }

  get id () {
    return this.#id
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

class ContentTracker extends Tracker {
  #parent
  #placeholder
  #nodes
  #options

  pop () {
    this.#nodes.at(-1).remove()
    this.#nodes.pop()
  }

  push (...args) {
    const nodes = args.map(arg => this.#getNodes(arg))
    const last = this.#nodes.at(-1)
  
    if (last === this.#placeholder) {
      last.replaceWith(...nodes)
      this.#nodes = nodes
    } else {
      last.after(...nodes)
      this.#nodes.push(...nodes)
    }
  }

  reconcile () {
    reconcileNodes(this.#nodes, this.value.map(node => this.#getNodes(node)))
  }

  render (parent, node, options) {
    this.#parent = parent
    this.#placeholder = node
    this.#nodes = [node]
    this.#options = options
    this.update()
  }

  shift () {
    this.#nodes[0].remove()
    this.#nodes.shift()
  }

  unshift (...args) {
    const nodes = args.map(arg => this.#getNodes(arg))
    this.#nodes.at(0).before(...nodes)
    this.#nodes.unshift(...nodes)
  }

  update () {
    const { value } = this

    if (Array.isArray(value) || value instanceof Template) {
      this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(value))
      return
    }

    // if (!this.property || value instanceof Template) {
    //   this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(value))
    //   return 
    // }

    // if (Array.isArray(value)) {
    //   console.log('HEYYYYY');
    //   this.#nodes = reconcileNodes(this.#nodes, value.map(item => this.#getNodes(item)))
    //   return
    // }

    this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(value))

    // switch (typeof value) {
    //   case 'string':
    //   case 'number': 
    //     this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(value))
    //     return
      
    //   case 'boolean':
    //     this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(`${value}`))
    //     return

    //   case 'object'

    //   default: throw new TypeError(`Unsupported tracked content type "${typeof value}"`)
    // }
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      return value.reduce((result, item) => {
        const output = this.#getNodes(item)
        result.push(...(Array.isArray(output) ? output : [output]))
        return result
      }, [])
    }

    if (value instanceof Template) {
      return [...Renderer.render(this.#parent, value, this.#options).childNodes]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': return [document.createTextNode(sanitizeString(!!value ? `${value}` : '', this.#options))]
      case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]
    
      default: return console.log('HANDLE ', typeof value)
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

  static registerContentTracker ({ target, property, transform }) {
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

  static #updateArrayTrackers (arr, handler, trackers, changelog, callback) {
    return (...args) => {
      const output = handler.apply(arr, args)

      for (let tracker of trackers) {
        callback(tracker, args)
      }

      return output
    }
  }

  static #getArrayMethodHandler (arr, name, handler, trackers, changelog) {
    switch (name) {
      case 'pop':
      case 'push':
      case 'shift':
      case 'unshift': return this.#updateArrayTrackers(arr, handler, trackers, changelog, (tracker, args) => tracker[property](...args))

      case 'copyWithin':
      case 'fill':
      case 'reverse':
      case 'sort':
      case 'splice': return this.#updateArrayTrackers(arr, handler, trackers, changelog, tracker => tracker.reconcile())
    
      default: return (...args) => handler.apply(arr, args)
    }
  }

  static #getArrayProxyHandlers (trackers, changelog = null) {
    return {
      get: (target, property) => {
        return target[property]
        // const method = target[property]
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
    const changelog = []

    const revocable = Proxy.revocable(obj, {
      get: (target, property) => {
        const value = target[property]

        if (Array.isArray(value)) {
          return new Proxy(value, this.#getArrayProxyHandlers())
        }

        return value
      },

      set: (target, property, value) => {
        changelog.push({
          timestamp: Date.now(),
          property,
          value: {
            old: target[property],
            new: value
          }
        })

        target[property] = value
        const { trackers } = this.getTarget(target) ?? {}

        for (let tracker of trackers) {
          tracker.update()
        }

        return true
      }
    })

    trackables.set(obj, { revocable, trackers: [], changelog })
    return revocable.proxy
  }

  static #register (tracker) {
    const trackable = this.getProxy(tracker.target)

    if (!trackable) {
      throw new Error(`Cannot track unobserved object`)
    }

    trackable.trackers.push(tracker)
    return tracker
  }
}

export function createTrackable (target) {
  return TrackableRegistry.getTarget(target) ?? TrackableRegistry.observe(target)
}