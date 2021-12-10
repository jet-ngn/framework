import NGN from 'NGN'

class Listener {
  #event
  #handler
  #options
  #abortController = null
  #id = Symbol('listener')

  constructor (evt, handler, options = null) {
    this.#event = evt
    this.#handler = handler
    this.#options = this.#processOptions(options)

    if (!this.#options.hasOwnProperty('signal')) {
      this.#abortController = new AbortController
      this.#options.signal = this.#abortController.signal
    }
  }

  #processOptions = options => {
    if (options === null) {
      return {}
    }

    switch (typeof options) {
      case 'object': return options
      case 'boolean': return { capture: options } 
      default: throw new TypeError(`Invalid listener options. Expected "object" or "boolean" but received "${typeof options}"`)
    }
  }

  get event () {
    return this.#event
  }

  get id () {
    return this.#id
  }

  get handler () {
    return this.#handler
  }

  get options () {
    return this.#options
  }

  abort () {
    this.#abortController.abort()
  }
}

class EventManager {
  #context
  #listeners = new Map

  constructor (element) {
    this.#context = element
  }

  add (evt, handler, options) {
    const listener = new Listener(evt, handler, options)

    listener.options.signal.onabort = evt => this.#listeners.delete(listener.id)
    this.#listeners.set(listener.id, listener)
    // TODO: Register this event in the DOMEventManager
    this.#context.addEventListener(listener.event, listener.handler, listener.options)

    return listener
  }

  remove (evt, handler) {
    switch (typeof evt) {
      case 'symbol': return this.#removeListenerById(evt)
      case 'string': return handler ? this.#removeListener(evt, handler) : this.#removeListeners(evt)
      default: throw new TypeError(`Expected "symbol" or "string," received "${typeof evt}"`)
    }
  }

  #removeListener = (evt, handler) => {
    const listener = [...this.#listeners.values()].find(listener => listener.handler === handler)
    
    if (!listener) {
      throw new ReferenceError(`No listener with the specified handler could be found.`)
    }

    listener.abort()
  }

  #removeListenerById = id => {
    const listener = this.#listeners.get(id)

    if (!listener) {
      throw new ReferenceError(`Listener not found.`)
    }

    listener.abort()
  }

  #removeListeners = evt => {
    let removed = false

    for (let [id, listener] of this.#listeners) {
      if (listener.event === evt) {
        listener.abort()
        removed = true
      }
    }

    if (!removed) {
      throw new ReferenceError(`No listeners for "${evt}" event are registered.`)
    }
  }
}

export default class Element {
  #original = null
  #revocable
  #events
  
  #getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

  constructor (element) {
    this.#original = element
    this.#events = new EventManager(element)
    
    this.#revocable = Proxy.revocable(element, {
      get: (target, property) => this.#getValue(this, this[property]) ?? this.#getValue(target, target[property]),
      set: (target, property, value) => Reflect.set((property in target) ? target : this, property, value)
    })

    return this.#revocable.proxy
  }

  remove () {
    // NGN.LEDGER.emit('element.remove', 'test')
    this.#revocable.revoke()
    this.#original.remove()
    this.#original = null
    // NGN.LEDGER.emit('element.removed', 'test')
  }

  mergeChildren (DOM) {
    console.log(...arguments);
  }

  on (evt, handler, options) {
    return this.#events.add(...arguments)
  }

  off (evt, handler) {
    this.#events.remove(...arguments)
  }
}