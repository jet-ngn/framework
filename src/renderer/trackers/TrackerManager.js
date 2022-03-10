import { typeOf } from '@ngnjs/libdata'
import { sanitizeString } from '../../utilities/StringUtils.js'

import DataCollection from '../../data/DataCollection.js'
import DataModel from '../../data/DataModel.js'
import DataStore from '../../data/DataStore.js'

import StringTracker from './StringTracker.js'
import ArrayTracker from './ArrayTracker.js'

export function attachTrackerManager (obj) {
  Object.assign(obj.prototype, {
    track (target, property, transform = null) {
      return {
        type: 'tracker',
        target,
        property,
        transform
      }
    }
  })

  return obj
}

export class TrackerRegistry {
  #context
  #targets = new Map
  #trackers = {}

  constructor (context) {
    this.#context = context
  }

  generateNodes (id) {
    const tracker = this.#trackers[id]

    if (!tracker) {
      throw new ReferenceError(`Tracker "${id}" not found`)
    }

    return tracker.generateNodes()
  }

  #trackString (tracker, registeredTarget) {
    const { target, property, initialValue, retainFormatting } = tracker
    let value = initialValue

    delete target[property]

    Object.defineProperty(target, property, {
      get: () => sanitizeString(value, { retainFormatting }),

      set: val => {
        value = val
        registeredTarget[property].forEach(tracker => tracker.update())
      }
    })
  }

  #trackArray (tracker, registeredTarget) {
    let { target, property } = tracker
    
    target[property] = new Proxy(target[property], {
      get: (target, property) => {
        const original = target[property]

        switch (property) {
          case 'copyWithin':
          case 'fill':
          case 'pop':
          case 'push':
          case 'reverse':
          case 'shift':
          case 'sort':
          case 'splice':
          case 'unshift': return (...args) => {
            original.apply(target, args)
            registeredTarget[tracker.property].forEach(tracker => tracker[property](...args))
          }
        
          default: return original
        }
      }
    })
  }

  #makeTracker ({ target, property }, cfg) {
    const trackable = target[property]

    if (trackable instanceof DataCollection) {
      console.log('DATA COLLECTION')
    }

    if (trackable instanceof DataModel) {
      console.log('DATA MODEL')
    }

    if (trackable instanceof DataStore) {
      console.log('DATA STORE')
    }

    const type = typeOf(trackable)

    switch (type) {
      case 'string':
      case 'number': return new StringTracker(arguments[0], cfg)

      case 'array': return new ArrayTracker(arguments[0], cfg)
      
      // case 'object': return new ObjectTracker(arguments[0], cfg)
    
      default: throw new TypeError(`Invalid tracked property type "${type}"`)
    }
  }

  #track (tracker, registeredTarget) {
    switch (tracker.constructor.name) {
      case 'StringTracker': return this.#trackString(...arguments)
      case 'ArrayTracker': return this.#trackArray(...arguments)
      // case 'DataFieldTracker': return this.#trackDataField(...arguments)
      // case 'DataStoreTracker': return this.#trackDataStore(...arguments)
    
      default: return
    }
  }

  register ({ target, property }, cfg) {
    let registeredTarget = this.#targets.get(target)
    const tracker = this.#makeTracker(...arguments)
    this.#trackers[tracker.id] = tracker

    if (!registeredTarget) {
      this.#targets.set(target, {
        [property]: [tracker]
      })

      this.#track(tracker, this.#targets.get(target))

    } else if (registeredTarget.hasOwnProperty(property)) {
      registeredTarget[property].push(tracker)
    } else {
      registeredTarget[property] = [tracker]
      this.#track(tracker, registeredTarget)
    }

    return tracker
  }

  get hasTrackers () {
    return this.#targets.size > 0
  }

  get (id) {
    return this.#targets[id]
  }
}