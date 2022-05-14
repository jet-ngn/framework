import { BUS } from 'NGN'
import EventHandler from '../EventHandler'

const entities = new Map

export default class EventRegistry {
  static get reservedNames () {
    return ['mount', 'unmount']
  }

  static addHandler (entity, evt, cb, cfg) {
    if (typeof evt !== 'string') {
      throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
    }
  
    if (typeof cb === 'object') {
      return this.pool(entity, evt, cb)
    }
  
    return this.#registerHandler(...arguments)
  }

  static pool (entity, namespace, cfg) {
    Object.keys(cfg).forEach(evt => this.addHandler(entity, `${namespace}.${evt}`, cfg[evt]))
  }

  static #registerHandler (entity, evt, cb, cfg = {}) {
    if (typeof cb !== 'function') {
      throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
    }
  
    if (typeof cfg !== 'object') {
      throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
    }

    const handler = new EventHandler(entity, evt, cb, cfg)

    const callback = function () {
      const valid = handler.call(this.event, ...arguments)
      !valid && this.remove()
    }

    const stored = entities.get(entity)

    if (stored) {
      stored[evt] = callback
    } else {
      entities.set(entity, {
        [evt]: callback
      })
    }

    return BUS.on(`${entity.scope}.${evt}`, callback)
  }

  // static removeAll ({ ignore }) {
  //   const ignoredViews = ignore ?? []

  //   for (let [entity, events] of entities) {
  //     if (ignoredViews.includes(entity)) {
  //       continue
  //     }

  //     Object.keys(events).forEach(evt => {
  //       BUS.off(`${entity.scope}.${evt}`, events[evt])
  //     })
  //   }

  //   entities.clear()
  // }

  static removeByEntity (entity) {
    const stored = entities.get(entity)

    if (!stored) {
      return
    }

    Object.keys(stored).forEach(evt => BUS.off(`${entity.scope}.${evt}`, stored[evt]))
    entities.delete(stored)
  }
}