import EventHandler from './EventHandler.js'

export default class EventManager {
  #context
  #cfg
  #initialized = false
  #events = {}

  constructor (context, cfg) {
    this.#context = context
    this.#cfg = cfg ?? {}
  }

  get events () {
    return this.#events
  }

  initialize () {
    if (this.#initialized) {
      throw Error(`${this.#context.type} "${this.#context.name}": Event Manager already initialized`)
    }

    Object.keys(this.#cfg).forEach(evt => this.#addHandler(evt, this.#cfg[evt]))
    this.#initialized = true
  }

  emit (evt, source, ...rest) {
    arguments[0] = this.#getEventName(arguments[0])
    NGN.BUS.emit(...arguments)
  }

  on (name, cb, cfg) {
    this.#addHandler(...arguments)
  }

  off (name) {
    const evt = this.getEvent(name)

    if (!evt) {
      return console.warn(`Event "${name}" has not been registered!`)
    }

    NGN.BUS.off(this.#getEventName(name))
    delete this.#events[name]
  }

  // TODO: Fix this
  getEvent (name) {
    return ['on', 'once'].reduce((handler, evt) => {
      if (this.#events[evt].hasOwnProperty(name)) {
        handler = this.#events[evt][name]
      }

      return handler
    }, null)
  }

  reset () {
    Object.keys(this.#events).forEach(evt => this.#events[evt].reset())
  }

  #addHandler = (evt, cb, cfg) => {
    if (NGN.typeof(cb) === 'object') {
      return this.#pool(evt, cb)
    }

    this.#registerHandler(evt, cb, cfg)
  }

  #pool = (namespace, cfg) => {
    if (NGN.typeof(namespace) === 'object') {
      cfg = namespace
      namespace = ''
    }

    Object.keys(cfg).forEach(evt => this.#addHandler(`${namespace}.${evt}`, cfg[evt]))
  }

  #getEventName = evt => `${this.#context ? `${this.#context.namespace}.` : ''}${evt}`

  getHandler (evt) {
    return this.#events[evt]
  }

  #registerHandler = (evt, cb, cfg = {}) => {
    const handler = new EventHandler(this.#context, this.#getEventName(evt), cfg, cb)
    this.#events[handler.event] = handler

    const context = this.#context
    const events = this.#events

    NGN.BUS.on(handler.event, function () {
      const { action } = handler.call(context, this.event, ...arguments)

      switch (action) {
        case 'delete':
          delete events[evt]
          break
      }
    })
  }
}
