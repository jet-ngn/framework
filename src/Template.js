import IdentifiableClass from './IdentifiableClass.js'

export default class Template extends IdentifiableClass {
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

  bindView (config) {
    this.#viewConfig = config
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

  setAttributes (config) {
    this.#attributes = { ...(this.#attributes ?? {}), ...config }
    return this
  }

  setProperty (name, value) {
    this.#properties = {
      ...(this.#properties ?? {}),
      [name]: value
    }

    return this
  }
}