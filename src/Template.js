import IdentifiedClass from './IdentifiedClass.js'

export default class Template extends IdentifiedClass {
  #type
  #strings
  #interpolations

  #attributes = null
  #config = null
  #listeners = null
  #properties = null
  #routes = null

  constructor (type, strings, ...interpolations) {
    super('template')
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get attributes () {
    return this.#attributes
  }

  get config () {
    return this.#config
  }

  get interpolations () {
    return this.#interpolations
  }

  get listeners () {
    return this.#listeners
  }

  get properties () {
    return this.#properties
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

  bind ({ attributes, config, on, routes }) {
    attributes && this.setAttributes(attributes)
    config && this.bindConfig(config)
    on && this.on(on)
    routes && this.bindRoutes(routes)
    return this
  }

  bindConfig (cfg) {
    this.#config = cfg
    return this
  }

  bindRoutes (routes) {
    this.#routes = routes
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

  setAttribute (name, value) {
    this.#attributes = {
      ...(this.#attributes ?? {}),
      [name]: value
    }

    return this
  }

  setAttributes (cfg) {
    this.#attributes = { ...(this.#attributes ?? {}), ...cfg }
    return this
  }

  setProperty (name, value) {
    this.#properties = {
      ...(this.#properties ?? {}),
      [name]: value
    }

    return this
  }

  setProperties (cfg) {
    this.#properties = { ...(this.#properties ?? {}), ...cfg }
    return this
  }
}