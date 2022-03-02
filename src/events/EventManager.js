import NGN from 'NGN'
import EventHandler from './EventHandler.js'
import { forEachKey } from '../utilities/IteratorUtils.js'

export function attachEventManager (obj) {
  Object.assign(obj.prototype, {
    emit (evt, ...args) {
      NGN.BUS.emit(getNamespacedEvent(this.name, evt), ...args)
    },

    on (evt, cfg, cb) {
      return addHandler(this, ...arguments)
    },

    off (evt, handler) {
      NGN.BUS.off(getNamespacedEvent(this.name, evt), handler)
    }
  })

  return obj
}

export function applyEventHandlers (target, cfg) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Invalid ${target.constructor.name} "on" configuration. Expected "object", received "${typeof cfg}"`)
  }

  forEachKey(cfg, (evt, handler) => target.on(evt, handler))
}

function addHandler (context, evt, cfg, cb) {
  if (typeof evt !== 'string') {
    throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
  }

  if (typeof cfg === 'function') {
    return registerHandler(context, evt, {}, cfg)
  }

  return cb ? registerHandler(...arguments) : pool(context, evt, cfg)
}

function getNamespacedEvent (namespace, evt) {
  return `${namespace}.${evt}`
}

function pool (context, namespace, cfg) {
  forEachKey(cfg, (evt, handler) => addHandler(context, getNamespacedEvent(namespace, evt), handler))
}

function registerHandler (context, evt, cfg, cb) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
  }

  if (typeof cb !== 'function') {
    throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
  }
  
  const handler = new EventHandler(evt, cfg, cb)

  return NGN.BUS.on(getNamespacedEvent(context.name, evt), function () {
    const valid = handler.call(context, this.event, ...arguments)

    if (!valid) {
      this.remove() // Remove listener from NGN.BUS
    }
  })
}