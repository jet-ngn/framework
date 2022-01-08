import DOMEventHandler from './DOMEventHandler.js'

export default class DOMEventListener {
  #element
  #event
  #handler
  #options
  #abortController = null
  #id = Symbol('DOMEventListener')

  constructor (element, event, callback, options = null) {
    this.#element = element
    this.#event = event
    this.#handler = new DOMEventHandler(event, callback, options)
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
      default: throw new TypeError(`Invalid DOM Event Listener options. Expected "object" or "boolean" but received "${typeof options}"`)
    }
  }

  get element () {
    return this.#element
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