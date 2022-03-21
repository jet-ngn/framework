import NGN from 'NGN'
import EventHandler from '../events/EventHandler.js'
import { forEachKey } from './IteratorUtils.js'

export function addHandler (context, evt, cb, cfg) {
  if (typeof evt !== 'string') {
    throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
  }

  if (typeof cfg === 'function') {
    return registerHandler(context, evt, {}, cfg)
  }

  return cb ? registerHandler(...arguments) : pool(context, evt, cfg)
}

export function getNamespacedEvent (namespace, evt) {
  return `${namespace}.${evt}`
}

function pool (context, namespace, cfg) {
  forEachKey(cfg, (evt, handler) => addHandler(context, getNamespacedEvent(namespace, evt), handler))
}

function registerHandler (context, evt, cb, cfg) {
  if (typeof cb !== 'function') {
    throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
  }

  if (typeof cfg !== 'object') {
    throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
  }

  const handler = new EventHandler(context, evt, cb, cfg)

  return NGN.BUS.on(getNamespacedEvent(context.name, evt), function () {
    const valid = handler.call(context, this.event, ...arguments)

    if (!valid) {
      this.remove() // Remove listener from NGN.BUS
    }
  })
}