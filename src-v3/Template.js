import { NANOID } from '@ngnjs/libdata'

export default class Template {
  #id = NANOID()
  #type
  #strings
  #interpolations

  #attributes = null
  #entityConfig = null
  #boundListeners = null
  #listeners = null
  #routes = null
  #routeCfg = null

  constructor ({ type, strings, interpolations }) {
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get attributes () {
    return this.#attributes
  }

  get boundListeners () {
    return this.#boundListeners
  }

  get entityConfig () {
    return this.#entityConfig
  }

  get id () {
    return this.#id
  }

  get interpolations () {
    return this.#interpolations
  }

  get listeners () {
    return this.#listeners
  }

  get routeCfg () {
    return this.#routeCfg
  }

  get routes () {
    return this.#routes
  }

  get strings () {
    return this.#strings
  }

  get type () {
    return this.#type
  }

  attr (cfg) {
    this.#attributes = { ...(this.#attributes ?? {}), ...cfg }
    return this
  }

  bind (config = null, options = {}) {
    this.#entityConfig = config ?? null
    this.#boundListeners = options.on ?? null
    this.#routeCfg = options.route ?? null
    return this
  }

  match (cfg) {
    this.#routes = cfg
    return this
  }

  on (evt, handler, cfg) {
    if (!this.#listeners) {
      this.#listeners = {}
    }

    if (typeof evt === 'object') {
      Object.keys(evt).forEach(name => this.on(name, evt[name]))
    } else if (this.#listeners.hasOwnProperty(evt)) {
      this.#listeners[evt].push({ handler, cfg })
    } else {
      this.#listeners[evt] = [{ handler, cfg }]
    }

    return this
  }
}