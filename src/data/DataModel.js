import DataBinder from './DataBinder.js'

export default class DataModel extends NGN.EventEmitter {
  #model

  #bindings = {
    attributes: {},
    classNames: {},
    interpolations: {}
  }

  #deferredBindings = {
    attributes: {},
    classNames: {},
    interpolations: {}
  }

  constructor (cfg) {
    super()

    const Model = new NGN.DATA.Model({ autoid: true, ...cfg })
    this.#model = new Model()

    if (cfg.hasOwnProperty('fields')) {
      Object.keys(cfg.fields).forEach(field => {
        Object.defineProperty(this, field, {
          get: () => this.#model[field],
          set: value => this.#model[field] = value
        })
      })
    }

    const self = this

    this.#model.on('*', function () {
      self.emit(this.event, ...arguments)
      // console.log(this.event)
    })
  }

  get data () {
    return this.#model.data
  }

  get representation () {
    return this.#model.representation
  }

  addField (name, cfg) {
    this.#model.addField(...arguments)
  }

  bind (field, process) {
    if (!this.hasField(field)) {
      throw new ReferenceError(`Data field "${field}" not found`)
    }

    const value = this.getField(field)

    return {
      type: 'data',
      field,
      initialValue: process ? process(value) : value,

      bindAttribute: (element, name, defer = false) => {
        this.#registerAttributeBinding(field, element, name, process, defer)
      },

      bindClassName: (element, className, defer = false) => {
        this.#registerClassNameBinding(field, element, className, process, defer)
      },

      bindInterpolation: (interpolation, defer = false) => {
        this.#registerInterpolationBinding(field, interpolation, process, defer)
      }
    }
  }

  getField (field) {
    return this.#model[field]
  }

  hasField(field) {
    return this.#model.hasDataField(field)
  }

  load (data) {
    this.#model.load(data)
  }

  setField (field, value) {
    this.#model[field] = value
  }

  // TODO: Collapse this into a single event listener rather than one per binding
  #addBindingListener = (collection, field, callback) => {
    this.#model.on(`field.update.${field}`, change => {
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
      this.#addBindingListener('attributes', field, (binding, change) => {
        const { element, attribute, process } = binding

        if (change.new !== change.old) {
          element.setAttribute(attribute, process ? process(change.new) : change.new)
        }
      })
    })
  }

  #bindClassName = (field, element, className, process) => {
    this.#bind('classNames', field, {
      element,
      className,
      process: process ?? null
    }, () => {
      this.#addBindingListener('classNames', field, (binding, change) => {
        const { element, process } = binding

        if (change.new !== change.old) {
          element.classList.toggle(className, change.new)
        }
      })
    })
  }

  #bindInterpolation = (field, interpolation, process) => {
    this.#bind('interpolations', field, {
      interpolation,
      process: process ?? null
    }, () => {
      this.#addBindingListener('interpolations', field, (binding, change) => {
        const { interpolation, process } = binding

        if (change.new !== change.old) {
          interpolation.update(process ? process(change.new) : change.new)
        }
      })
    })
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

  #registerClassNameBinding = (field, element, className, process, defer = false) => {
    if (!defer) {
      return this.#bindClassName(field, element, className, process)
    }

    console.log('TODO: HANDLE DEFERRED CLASSNAME BINDING')
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
