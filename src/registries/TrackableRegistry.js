import Template from '../Template.js'
import { TrackingInterpolation } from '../Interpolation.js'
import { NANOID } from '@ngnjs/libdata'
import { reconcileNodes } from '../Reconciler.js'
import { sanitizeString } from '../utilities/StringUtils.js'
import Renderer, { getOptions } from '../Renderer.js'
import EntityRegistry from './EntityRegistry.js'

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
    const last = this.#nodes.at(-1)
    const { unmount } = EntityRegistry.getEntryByNode(last) ?? {}
    
    if (unmount) {
      unmount()
    }

    last.remove()
    this.#nodes.pop()
  }

  push () {
    const newNodes = this.#getNodes(this.value.at(-1))
    const last = this.#nodes.at(-1)

    if (!last) {
      this.#placeholder.replaceWith(...newNodes)
      this.#nodes = newNodes
    } else {
      last.after(...newNodes)
      this.#nodes.push(...newNodes)
    }
  }

  reconcile () {
    reconcileNodes(this.#nodes, this.value.map(node => this.#getNodes(node)))
  }

  render (parent, node, options) {
    this.#parent = parent
    this.#placeholder = node
    this.#nodes = [node]
    this.#options = getOptions(options, node)
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
    this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(this.value))
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
      const renderer = new Renderer(this.#parent, this.#options)
      return [...renderer.render(value, true).childNodes]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': return [document.createTextNode(sanitizeString(!!value ? `${value}` : '', this.#options))]
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]
    
      default: return console.log('HANDLE ', typeof value)
    }
  }

  #replaceWith (nodes) {
    for (let i = 1, { length } = this.#nodes; i < length; i++) {
      this.#nodes[i].remove()
    }
    
    this.#nodes.at(0).replaceWith(...nodes)
    this.#nodes = nodes
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

  static registerContentTracker ({ target, property, transform }, children) {
    return this.#register(new ContentTracker(...arguments), children)
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
          tracker.update()
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
      throw new Error(`Cannot track unobserved object`)
    }

    trackable.trackers.push(tracker)
    return tracker
  }
}

export function createTrackable (target) {
  return TrackableRegistry.getTarget(target) ?? TrackableRegistry.observe(target)
}

export function getChanges (trackable) {
  return TrackableRegistry.getChanges(trackable)
}

export function track (target, property, transform) {
  return TrackableRegistry.track(...arguments)
}