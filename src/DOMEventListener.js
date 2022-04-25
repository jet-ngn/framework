import DOMEventHandler from './DOMEventHandler.js'

export default class DOMEventListener {
  #entity
  #node
  #event
  #handler
  #options
  #abortController = null
  #id = Symbol('DOMEventListener')

  constructor (entity, node, event, callback, options = null) {
    this.#entity = entity
    this.#node = node
    this.#event = event
    this.#handler = new DOMEventHandler(entity, event, callback, options)
    this.#options = this.#processOptions(options)

    if (!this.#options.hasOwnProperty('signal')) {
      this.#abortController = new AbortController
      this.#options.signal = this.#abortController.signal
    }
  }

  get node () {
    return this.#node
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

  #processOptions (options) {
    if (options === null) {
      return {}
    }

    switch (typeof options) {
      case 'object': return options
      case 'boolean': return { capture: options } 
      default: throw new TypeError(`Invalid Event Listener options. Expected "object" or "boolean" but received "${typeof options}"`)
    }
  }
}