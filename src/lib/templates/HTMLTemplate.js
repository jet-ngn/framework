import Template from './Template'

export default class HTMLTemplate extends Template {
  #attributes = null
  #listeners = null
  #properties = null
  #viewConfig = null

  constructor (strings, ...interpolations) {
    super(strings, interpolations, 'html-template')
  }

  get attributes () {
    return this.#attributes
  }

  get listeners () {
    return this.#listeners
  }

  get properties () {
    return this.#properties
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
    properties && this.setProperties(properties)
    view && this.attachView(view)
    return this
  }

  on (evt, handler, cfg = null) {
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