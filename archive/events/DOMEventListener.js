import DOMEventHandler from './DOMEventHandler.js'

export default class DOMEventListener {
  #view
  #node
  #event
  #handler
  #options
  #abortController = null
  #id = Symbol('DOMEventListener')

  constructor (view, node, event, callback, options = null) {
    this.#view = view
    this.#node = node
    this.#event = event
    this.#handler = new DOMEventHandler(view, event, callback, options)
    this.#options = processOptions(options)

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
}

function processOptions (options) {
  if (options === null) {
    return {}
  }

  switch (typeof options) {
    case 'object': return options
    case 'boolean': return { capture: options } 
    default: throw new TypeError(`Invalid Event Listener options. Expected "object" or "boolean" but received "${typeof options}"`)
  }
}