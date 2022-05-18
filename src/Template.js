import IdentifiedClass from './IdentifiedClass.js'

export default class Template extends IdentifiedClass {
  #type
  #strings
  #interpolations

  #attributes = null
  #listeners = null
  #properties = null
  #viewConfig = null

  constructor (type, strings, ...interpolations) {
    super('template')
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get attributes () {
    return this.#attributes
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

  get strings () {
    return this.#strings
  }

  get type () {
    return this.#type
  }

  get viewConfig () {
    return this.#viewConfig
  }

  attachView (config) {
    this.#viewConfig = config
    return this
  }

  config ({ attributes, properties, on, view }) {
    attributes && this.setAttributes(attributes)
    on && this.on(on)
    properties && this.setProperties(attributes)
    view && this.attachView(view)
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

  set ({ attributes, properties }) {
    return this.config(...arguments)
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