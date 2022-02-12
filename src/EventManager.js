import NGN from 'NGN'
import { forEachKey } from './utilities.js'

const getNamespacedEvent = (namespace, evt) => `${namespace}.${evt}`

class EventHandler {
  #id = Symbol()
  
  #event
  #callback

  #min
  #max
  #interval
  #start
  #ttl

  #calls = 0
  #executions = 0

  constructor (event, { max, min, interval, start, ttl }, callback) {
    this.#event = event
    this.#callback = callback

    this.#max = max ?? Infinity
    this.#min = min ?? 0
    this.#interval = interval ?? 0
    this.#start = start ?? 0
    this.#ttl = ttl ?? -1
  }

  get event () {
    return this.#event
  }

  call (context, eventName, ...args) {
    this.#calls++

    if ((this.#min > 0 && this.#calls < this.#min) || (this.#interval > 0 && this.#calls % this.#interval !== 0)) {
      return
    }

    return this.#execute(...arguments)
  }

  #execute = (context, evt, ...args) => {
    const data = {
      name: getNamespacedEvent(context.name, this.#event),
      calls: this.#calls
    }

    if (this.#event.includes('*')) {
      data.referredEvent = evt
    }

    this.#executions++

    this.#callback.call({
      ...context,
      event: { ...data, executions: this.#executions }
    }, ...args)
  }
}

const EventManager = (context, cfg) => {
  const { name } = context
  const handlers = {}

  const self = {
    on: addHandler,
    
    off: evt => {
      const handler = handlers[evt] ?? null

      if (!handler) {
        throw new Error(`"${evt}" handler not found`)
      } 

      NGN.BUS.off(evt)
      delete handlers[evt]
    },
    
    emit: (evt, ...payload) => NGN.BUS.emit(getNamespacedEvent(name, evt), ...payload)
  }

  function addHandler (evt, cfg, cb) {
    if (typeof evt !== 'string') {
      throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
    }
  
    if (typeof cfg === 'function') {
      return registerHandler(evt, {}, cfg)
    }
  
    cb ? registerHandler(...arguments) : pool(evt, cfg)
  }
  
  function registerHandler (evt, cfg, cb) {
    if (typeof cfg !== 'object') {
      throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
    }
  
    if (typeof cb !== 'function') {
      throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
    }
    
    const handler = new EventHandler(evt, cfg, cb)
    handlers[evt] = handler
    // console.log(evt);
    NGN.BUS.on(getNamespacedEvent(name, evt), function () {
      handler.call({ ...context, ...self }, this.event, ...arguments)

      const { max, calls } = handler

      if (max < Infinity && calls === max) {
        delete handlers[evt]
      }
    })
  }
  
  const pool = (namespace, cfg) => forEachKey(cfg, (evt, handler) => addHandler(getNamespacedEvent(namespace, evt), handler))

  forEachKey(cfg, addHandler)

  return self
}

export { EventManager as default }