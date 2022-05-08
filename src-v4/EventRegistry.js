import { BUS } from 'NGN'
import EventHandler from './EventHandler.js'

const views = new Map

export default class EventRegistry {
  static get reservedNames () {
    return ['mount', 'unmount', 'route.change']
  }

  static addHandler (context, evt, cb, cfg = {}) {
    if (typeof evt !== 'string') {
      throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
    }
  
    if (typeof cb === 'object') {
      return this.pool(context, evt, cb)
    }
  
    return this.registerHandler(...arguments)
  }

  static pool (context, namespace, cfg) {
    Object.keys(cfg).forEach(evt => this.addHandler(context, `${namespace}.${evt}`, cfg[evt]))
  }

  static registerHandler (context, evt, cb, cfg = {}) {
    if (typeof cb !== 'function') {
      throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
    }
  
    if (typeof cfg !== 'object') {
      throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
    }

    const handler = new EventHandler(context, evt, cb, cfg)

    const callback = function () {
      const valid = handler.call(this.event, ...arguments)
  
      if (!valid) {
        this.remove() // Remove listener from NGN.BUS
      }
    }

    const stored = views.get(context)

    if (!stored) {
       views.set(context, {
         [evt]: callback
       })
    } else {
      stored[evt] = callback
    }

    return BUS.on(`${context.scope}.${evt}`, callback)
  }

  static removeAllByView (view) {
    const stored = views.get(view)

    if (!stored) {
      return
    }

    Object.keys(stored).forEach(evt => {
      BUS.off(`${view.scope}.${evt}`, stored[evt])
    })
  }
}