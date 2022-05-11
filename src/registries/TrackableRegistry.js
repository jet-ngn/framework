import {
  AttributeTracker,
  AttributeListTracker,
  BooleanAttributeListTracker,
  // BindingTracker,
  // ArrayContentTracker,
  ContentTracker
} from '../lib/trackers.js'

const trackables = new Map
const views = new Map

export default class TrackableRegistry {
  static getProxy (proxy) {
    return [...trackables.values()].find(({ revocable }) => revocable.proxy === proxy)
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

  // static registerBindingTracker (node, cfg, parent, listeners) {
  //   return this.#register(new BindingTracker(...arguments))
  // }

  static registerContentTracker (cfg, parent) {
    return this.#register(new ContentTracker(...arguments))
    // return Array.isArray(cfg.target)
    //   ? this.#register(new ArrayContentTracker(...arguments), true)
    //   : this.#register(new ContentTracker(...arguments), true)
  }

  static track (target) {
    if (Array.isArray(target)) {
      return this.#trackArray(target)
    }

    switch (typeof target) {
      case 'object': return this.#trackObject(target)
      default: throw new TypeError(`Tracking "${typeof target}" objects is not currently supported`)
    }
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

  static #register (tracker, storeView = false) {
    const trackable = this.getProxy(tracker.target)

    if (!trackable) {
      throw new Error(`Cannot track non-Trackable object`)
    }

    trackable.trackers.push(tracker)

    if (storeView) {
      const { parent } = tracker
      const registeredView = views.get(parent)

      if (!registeredView) {
        views.set(parent, { trackers: [tracker], trackables: [trackable] })
      } else {
        registeredView.trackers.push(tracker)

        if (!registeredView.trackables.includes(trackable)) {
          registeredView.trackables.push(trackable)
        }
      }
    }

    return tracker
  }

  static #trackArray (arr) {
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

  static #trackObject (obj) {
    const revocable = Proxy.revocable(obj, {
      get: (target, property) => target[property],

      set: (target, property, value) => {
        const current = target[property]

        if (current === value) {
          return true
        }

        const { trackers, changelog } = trackables.get(target)

        changelog.push({
          timestamp: Date.now(),
          property,
          value: {
            old: current,
            new: value
          }
        })

        target[property] = value

        for (let tracker of trackers) {
          if (tracker.property === property || tracker.property === parseInt(property) || !tracker.property) {
            tracker.reconcile()
          }
        }

        return true
      }
    })

    trackables.set(obj, { revocable, trackers: [], changelog: [] })
    return revocable.proxy
  }
}

export class Trackable {
  constructor (target) {
    const existing = trackables.get(target)
    return existing?.revocable?.proxy ?? TrackableRegistry.track(target)
  }
}