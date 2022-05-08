import { typeOf } from '@ngnjs/libdata'
import TrackingInterpolation from './TrackingInterpolation.js'

import {
  AttributeTracker,
  AttributeListTracker,
  BooleanAttributeListTracker,
  BindingTracker,
  ArrayContentTracker,
  ContentTracker
} from './Tracker.js'

const trackables = new Map
const views = new Map

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

  static observe (target) {
    switch (typeOf(target)) {
      case 'array': return this.#observeArray(target)
      case 'object': return this.#observeObject(target)
      default: throw new TypeError(`Tracking "${typeof target}" objects is not currently supported`)
    }
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
    return Array.isArray(cfg.target)
      ? this.#register(new ArrayContentTracker(...arguments), true)
      : this.#register(new ContentTracker(...arguments), true)
  }

  static removeContentTrackersByView (view) {
    const registeredView = views.get(view)
    
    if (!registeredView) {
      return
    }

    registeredView.trackers.forEach(tracker => {
      registeredView.trackables.forEach(trackable => {
        const { trackers } = trackable
        trackable.trackers = trackers.filter(registeredTracker => registeredTracker !== tracker)
      })
    })
  }

  static track (target, property, transform) {
    return new TrackingInterpolation(...arguments)
  }

  static untrack (target) {
    target = this.get(target)
    console.log(target);
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

  static #register (tracker, storeView = false) {
    const trackable = this.getProxy(tracker.target)

    if (!trackable) {
      throw new Error(`Cannot track untrackable object`)
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
}

export function getChanges (trackable) {
  return TrackableRegistry.getChanges(trackable)
}

export function track (target, property, transform) {
  return TrackableRegistry.track(...arguments)
}