import NGN from 'NGN'
import { forEachKey } from './utilities.js'

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

// This class adds functionality to the NGN Event Handler.
// Some of it should be considered for integration into NGN.
class EventHandler {
  #id = Symbol()
  
  #event
  #callback

  #minCalls
  #maxCalls
  #maxExecutions
  #interval
  #ttl

  #calls = 0
  #executions = 0

  constructor (event, { min, max, tries, interval, ttl }, callback) {
    this.#event = event
    this.#callback = callback

    this.#minCalls = min ?? 0
    this.#maxCalls = tries ?? Infinity
    this.#maxExecutions = max ?? Infinity
    this.#interval = interval ?? 0
    // this.#ttl = ttl ?? -1
  }

  get interval () {
    return this.#interval
  }

  get minCalls () {
    return this.#minCalls
  }

  get maxCalls () {
    return this.#maxCalls
  }

  get maxExecutions () {
    return this.#maxExecutions
  }

  // get ttl () {
  //   return this.#ttl
  // }

  async call (context, eventName, ...args) {
    this.#calls++

    if (this.#calls < this.#minCalls) {
      return false
    }

    if (this.#calls > this.#maxCalls) {
      return false
    }

    if (!!(this.#calls % this.#interval)) {
      return true
    }

    return await this.#execute(...arguments)
  }

  #execute = async (context, evt, ...args) => {
    this.#executions++

    if (this.#executions > this.#maxExecutions) {
      return false
    }

    context.event = {
      name: getNamespacedEvent(context.name, this.#event),
      calls: this.#calls,
      executions: this.#executions
    }

    if (this.#event.includes('*')) {
      context.event.origin = evt
    }

    await this.#callback.call(context, ...args)
    delete context.event

    return true
  }
}