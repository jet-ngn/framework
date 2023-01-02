import Template from './Template'

export default class HTMLTemplate extends Template {
  #attributes = null
  #listeners = null
  #properties = null
  #routeConfig = null
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

  get routeConfig () {
    return this.#routeConfig
  }

  get viewConfig () {
    return this.#viewConfig
  }

  attachRoutes (config) {
    if (!!this.#viewConfig) {
      throw new Error(`Cannot attach Routes to element with attached View.`)
    }

    return this.#apply(() => this.#routeConfig = config)
  }

  attachView (config) {
    if (!!this.#routeConfig) {
      throw new Error(`Cannot attach View to element with attached Routes.`)
    }

    return this.#apply(() => this.#viewConfig = config)
  }

  on (evt, handler, cfg = null) {
    return this.#apply(() => {
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
    })
  }

  set ({ attributes = null, properties = null }) {
    return this.#apply(() => {
      attributes && this.setAttributes(attributes)
      properties && this.setProperties(properties)
    })
  }

  setAttribute (name, value) {
    return this.#apply(() => {
      this.#attributes = {
        ...(this.#attributes ?? {}),
        [name]: value
      }
    })
  }

  setAttributes (cfg) {
    return this.#apply(() => this.#attributes = { ...(this.#attributes ?? {}), ...cfg })
  }

  setProperty (name, value) {
    return this.#apply(() => {
      this.#properties = {
        ...(this.#properties ?? {}),
        [name]: value
      }
    })
  }

  setProperties (cfg) {
    return this.#apply(() => this.#properties = { ...(this.#properties ?? {}), ...cfg })
  }

  #apply (fn) {
    fn()
    return this
  }
}