import JetClass from './JetClass.js'

export default class Template extends JetClass {
  #type
  #strings
  #interpolations

  #attributes = null
  #listeners = null
  #properties = null
  
  #bound = {
    view: null,
    listeners: null,
    route: null
  }

  constructor ({ type, strings, interpolations }) {
    super()
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get attributes () {
    return this.#attributes
  }

  get bound () {
    return this.#bound
  }

  get interpolations () {
    return this.#interpolations
  }

  get listeners () {
    return this.#listeners
  }

  get strings () {
    return this.#strings
  }

  get type () {
    return this.#type
  }

  bindView (view = null, options = {}) {
    this.#bound = {
      view,
      listeners: options.on ?? null,
      route: options.route ?? null
    }
    
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

  setProperties (config) {
    this.#properties = { ...(this.#properties ?? {}), ...config }
    return this
  }
}