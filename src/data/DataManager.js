import DataCollection from './DataCollection.js'

export default class DataManager {
  #attached = {}
  #context
  #cfg
  #initialized = false
  #collection

  #bindings = {
    attributes: {},
    interpolations: {}
  }

  #deferredBindings = {
    attributes: {},
    interpolations: {}
  }

  constructor (context, fields) {
    this.#context = context
    this.#cfg = fields
  }

  get data () {
    const { data } = this.#collection

    Object.defineProperty(data, 'bind', {
      value: this.#createBinding
    })

    return data
  }

  applyDeferredBindings () {
    const { attributes, interpolations } = this.#deferredBindings

    Object.keys(attributes).forEach(field => {
      attributes[field].forEach(({ name, element, process }) => {
        this.#bindAttribute(field, element, name, process)
      })
    })

    Object.keys(interpolations).forEach(field => {
      interpolations[field].forEach(({ interpolation, process }) => {
        this.#bindInterpolation(field, interpolation, process)
      })
    })
  }

  // attach (key, value) {
  //   this.#data.attach(...arguments)
  // }

  initialize () {
    if (this.#initialized) {
      throw Error(`${this.#context.type} "${this.#context.name}": Data Manager already initialized`)
    }

    this.#collection = new DataCollection(this.#context, this.#cfg)
    this.#initialized = true
  }

  // TODO: Collapse this into a single event listener rather than one per binding
  #addBindingListener = (collection, field, callback) => {
    this.#context.on(`data.${field}.changed`, (evt, change) => {
      const bindings = this.#bindings[collection][field]

      for (let i = 0, length = bindings.length; i < length; i++) {
        callback(bindings[i], change)
      }
    })
  }

  #bind = (collection, property, obj, cb) => {
    collection = this.#bindings[collection]

    if (!collection.hasOwnProperty(property)) {
      collection[property] = [obj]
      return cb(property)
    }

    collection[property].push(obj)
  }

  #bindAttribute = (field, element, attribute, process) => {
    this.#bind('attributes', field, {
      element,
      attribute,
      process: process ?? null
    }, () => {
      this.#addBindingListener('attributes', field, (binding, { previous, current }) => {
        const { element, attribute, process } = binding

        if (current !== previous) {
          element.setAttribute(attribute, process ? process(current) : current)
        }
      })
    })
  }

  #bindInterpolation = (field, interpolation, process) => {
    this.#bind('interpolations', field, {
      interpolation,
      process: process ?? null
    }, () => {
      this.#addBindingListener('interpolations', field, (binding, { previous, current }) => {
        const { interpolation, process } = binding

        if (current !== previous) {
          interpolation.update(process ? process(current) : current)
        }
      })
    })
  }

  #createBinding = (field, process) => {
    if (!this.#collection.hasField(field)) {
      throw new ReferenceError(`${this.#context.constructor.name} "${this.#context.name}": Data field "${field}" not found`)
    }

    const value = this.#collection.getField(field)

    return {
      type: 'data',
      field,
      initialValue: process ? process(value) : value,

      bindAttribute: (element, name, defer = false) => {
        this.#registerAttributeBinding(field, element, name, process, defer)
      },

      bindInterpolation: (interpolation, defer = false) => {
        this.#registerInterpolationBinding(field, interpolation, process, defer)
      }
    }
  }

  #registerAttributeBinding = (field, element, name, process, defer) => {
    if (!defer) {
      return this.#bindAttribute(field, element, name, process)
    }

    const { attributes } = this.#deferredBindings
    const binding = { element, name, process }

    if (attributes.hasOwnProperty(field)) {
      this.#deferredBindings.attributes[field].push(binding)
    } else {
      this.#deferredBindings.attributes[field] = [binding]
    }
  }

  #registerInterpolationBinding = (field, interpolation, process, defer = false) => {
    if (!defer) {
      return this.#bindInterpolation(field, interpolation, process)
    }

    const { interpolations } = this.#deferredBindings
    const binding = { interpolation, process }

    if (interpolations.hasOwnProperty(field)) {
      this.#deferredBindings.interpolations[field].push(binding)
    } else {
      this.#deferredBindings.interpolations[field] = [binding]
    }
  }
}
