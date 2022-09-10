import EventHandler from './EventHandler'

const listeners = new Map
const views = new Map

export function addHandler (view, evt, cb, cfg) {
  if (typeof evt !== 'string') {
    throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
  }

  if (typeof cb === 'object') {
    return pool(view, evt, cb)
  }

  return registerHandler(...arguments)
}

export function emit (name, ...args) {
  const handlers = listeners.get(name)

  handlers && handlers.forEach(handler => handler.call({
    event: name,
    remove: () => remove(name, handlers, handler)
  }, ...args))
}

export function on (name, handler) {
  const handlers = listeners.get(name)
  handlers ? handlers.push(handler) : listeners.set(name, [handler])
}

export function off (name, handler) {
  return remove(name, listeners.get(name), handler)
}

function pool (view, namespace, cfg) {
  Object.keys(cfg).forEach(evt => addHandler(view, `${namespace}.${evt}`, cfg[evt]))
}

function registerHandler (view, evt, cb, cfg = {}) {
  if (typeof cb !== 'function') {
    throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
  }

  if (typeof cfg !== 'object') {
    throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
  }

  const handler = new EventHandler(view, cb, cfg)

  const callback = function () {
    const valid = handler.call(this.event, ...arguments)
    !valid && this.remove()
  }

  const storedView = views.get(view)

  if (storedView) {
    storedView[evt] = callback
  } else {
    views.set(view, {
      [evt]: callback
    })
  }

  return on(`${view.scope}.${evt}`, callback)
}

function remove (name, handlers, handler) {
  if (!handlers) {
    return
  }

  if (!handler) {
    return listeners.delete(name)
  }

  listeners.set(name, handlers.filter(storedHandler => storedHandler !== handler))
}