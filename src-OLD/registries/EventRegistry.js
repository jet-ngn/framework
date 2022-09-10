import Bus from '../Bus'
import EventHandler from '../EventHandler'

const views = new Map

export const reservedNames = ['mount', 'unmount']

export function addHandler (view, evt, cb, cfg) {
  if (typeof evt !== 'string') {
    throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
  }

  if (typeof cb === 'object') {
    return pool(view, evt, cb)
  }

  return registerHandler(...arguments)
}

export function removeAllViewEvents () {
  for (let [view, events] of views) {
    Object.keys(events).forEach(evt => {
      Bus.off(`${view.scope}.${evt}`, events[evt])
    })
  }

  views.clear()
}

export function removeEventsByView (view) {
  const stored = views.get(view)

  if (!stored) {
    return
  }

  Object.keys(stored).forEach(evt => Bus.off(`${view.scope}.${evt}`, stored[evt]))
  views.delete(stored)
}

export function logViews () {
  console.log(views);
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

  const handler = new EventHandler(view, evt, cb, cfg)

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

  return Bus.on(`${view.scope}.${evt}`, callback)
}