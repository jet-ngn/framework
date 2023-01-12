import EventHandler from './EventHandler'
import { INTERNAL_ACCESS_KEY } from '../../env'

export let listeners = new Map
export let views = new Map

export default class Bus {
  static async emit (name, ...args) {
    const handlers = listeners.get(name)

    if (!handlers) {
      return
    }

    for (const handler of handlers) {
      await handler.call({
        event: name,
        remove: () => remove(name, handlers, handler)
      }, ...args)
    }
  }

  static off (name, handler) {
    return remove(name, listeners.get(name), handler)
  }

  static on (name, handler) {
    const handlers = listeners.get(name)
    handlers ? handlers.push(handler) : listeners.set(name, [handler])
  }
}

export function addHandler (view, evt, cb, cfg) {
  if (typeof evt !== 'string') {
    throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
  }

  if (typeof cb === 'object') {
    return pool(view, evt, cb)
  }

  return registerHandler(...arguments)
}

export async function emitInternal (view, evt, ...args) {
  await view.emit(INTERNAL_ACCESS_KEY, evt, ...args)
}

function pool (view, namespace, cfg) {
  new Map(Object.entries(cfg)).forEach((handler, evt) => addHandler(view, `${namespace}.${evt}`, handler))
}

function registerHandler (view, evt, cb, cfg = {}) {
  if (typeof cb !== 'function') {
    throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
  }

  if (typeof cfg !== 'object') {
    throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
  }

  const handler = new EventHandler(...arguments)

  const callback = async function () {
    const valid = await handler.call(this.event, ...arguments)
    !valid && this.remove()
  }

  const storedView = views.get(view)

  if (storedView) {
    storedView[evt] = callback
  } else {
    views.set(view, { [evt]: callback })
  }

  return Bus.on(`${view.scope}.${evt}`, callback)
}

function remove (name, handlers, handler) {
  if (!handlers) {
    return
  }

  if (!handler) {
    return listeners.delete(name)
  }

  handlers.splice(handlers.indexOf(handler))
  
  if (handlers.length === 0) {
    return listeners.delete(name)
  }

  listeners.set(name, handlers)
}

// export function removeEvents () {
//   listeners = new Map
//   views = new Map
// }

export function removeEventsByView (view) {
  const stored = views.get(view)

  if (!stored) {
    return
  }

  Object.keys(stored).forEach(evt => Bus.off(`${view.scope}.${evt}`, stored[evt]))
  views.delete(view)
}

export function logEvents () {
  console.log(listeners)
  console.log(views)
}