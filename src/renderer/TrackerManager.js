import Interpolation from './Interpolation.js'
import DataCollection from '../data/DataCollection.js'
import DataModel from '../data/DataModel.js'
import DataStore from '../data/DataStore.js'
import { sanitizeString } from '../utilities/StringUtils.js'

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
  #tracked = new Map
  #trackers = {}

  constructor (context) {
    this.#context = context
  }

  #trackProperty (target, property, transform, retainFormatting) {
    if (target instanceof DataCollection) {
      return console.log('HANDLE DATA COLLECTION')
    }

    if (target instanceof DataModel) {
      return console.log('HANDLE DATA MODEL')
    }

    if (target instanceof DataStore) {
      return console.log('HANDLE DATA STORE')
    }

    let value = target[property]
    delete target[property]

    Object.defineProperty(target, property, {
      get: () => sanitizeString(value, retainFormatting),

      set: val => {
        value = val
        const trackers = this.#tracked.get(target)
        this.#tracked.get(target).ids.forEach(id => this.#trackers[id].update())
      }
    })
  }

  register (target, property, transform, retainFormatting) {
    const tracker = new Tracker(...arguments)
    const { id } = tracker
    let registered = this.#tracked.get(target)

    this.#trackers[id] = tracker

    if (registered) {
      registered.ids.push(tracker.id)

      if (!registered.properties.includes(property)) {
        this.#trackProperty(...arguments)
        registered.properties.push(property)
      }

    } else {
      this.#tracked.set(target, {
        properties: [tracker.property],
        ids: [id]
      })

      this.#trackProperty(...arguments)
    }

    return tracker
  }

  get hasTrackers () {
    return this.#tracked.size > 0
  }

  get (id) {
    return this.#trackers[id]
  }
}

class Tracker extends Interpolation {
  node

  constructor (target, property, transform) {
    super()
    this.target = target
    this.property = property
    this.transform = transform
  }

  get value () {
    const value = this.target[this.property]
    return `${this.transform ? this.transform(value) : value}`
  }

  update () {
    if (this.node.data !== this.value) {
      this.node.data = this.value
    }
  }
}