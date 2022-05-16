import Bus from '../Bus'
import EventHandler from '../EventHandler'

const views = new Map

export default class EventRegistry {
  static get reservedNames () {
    return ['mount', 'unmount']
  }

  static addHandler (view, evt, cb, cfg) {
    if (typeof evt !== 'string') {
      throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
    }
  
    if (typeof cb === 'object') {
      return this.pool(view, evt, cb)
    }
  
    return this.#registerHandler(...arguments)
  }

  static pool (view, namespace, cfg) {
    Object.keys(cfg).forEach(evt => this.addHandler(view, `${namespace}.${evt}`, cfg[evt]))
  }

  static #registerHandler (view, evt, cb, cfg = {}) {
    if (typeof cb !== 'function') {
      throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
    }
  
    if (typeof cfg !== 'object') {
      throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
    }

    const handler = new EventHandler(view, evt, cb, cfg)

    const callback = function () {
      const valid = handler.call(this.event, ...arguments)
      !valid && this.remove()
    }

    const storedView = views.get(view)

    if (storedView) {
      storedView[evt] = handler
    } else {
      views.set(view, {
        [evt]: callback
      })
    }

    return Bus.on(`${view.scope}.${evt}`, callback)
  }

  // static removeAll ({ ignore }) {
  //   const ignoredViews = ignore ?? []

  //   for (let [view, events] of views) {
  //     if (ignoredViews.includes(view)) {
  //       continue
  //     }

  //     Object.keys(events).forEach(evt => {
  //       Bus.off(`${view.scope}.${evt}`, events[evt])
  //     })
  //   }

  //   views.clear()
  // }

  static removeByView (view) {
    const stored = views.get(view)

    if (!stored) {
      return
    }

    Object.keys(stored).forEach(evt => Bus.off(`${view.scope}.${evt}`, stored[evt]))
    views.delete(stored)
  }
}