// import DataCollection from './DataCollection.js'
import DataChange from './DataChange.js'
import DataModel from './DataModel.js'
import DataStore from './DataStore.js'

export default class DataManager {
  #context
  #cfg
  #initialized = false

  #attached = {}
  #model
  #fields = []
  #models = {}
  #stores = {}
  #reserved = ['bind', 'tojson']
  #data = {}
  
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

    this.#model = new (NGN.DATA.Model({ autoid: true }))
    this.#applyModelListeners(null, this.#model)
  }

  get data () {
    return this.#data
  }

  add (name, value) {
    if (this.#reserved.includes(name.toLowerCase())) {
      throw new Error(`Cannot store data field: "${name}" is a reserved word`)
    }

    if (value instanceof DataModel) {
      return this.#addModel(name, value)
    }

    if (value instanceof DataStore) {
      return this.#addStore(name, value)
    }

    this.#addField(name, value)
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

  attach (data) {
    Object.keys(data).forEach(key => {
      if (this.#reserved.includes(key)) {
        throw new Error(`Cannot store data field "${key}" because it is a reserved word`)
      }

      if (this.#data.hasOwnProperty(key)) {
        console.warn(`Data item "${key}" already exists and will be overwritten`)
      }

      this.#attached[key] = data[key]
      this.#data[key] = data[key]
    })
  }

  clearAttachments () {
    Object.keys(this.#attached).forEach(attachment => {
      delete this.#data[attachment]
    })

    this.#attached = {}
  }

  #createBinding = (field, process) => {
    if (!this.hasField(field)) {
      throw new ReferenceError(`${this.#context.constructor.name} "${this.#context.name}": Data field "${field}" not found`)
    }

    const value = this.getField(field)

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

  getField(field) {
    return this.#model[field]
  }

  hasField(field) {
    return this.#fields.includes(field)
  }

  initialize () {
    if (this.#initialized) {
      throw Error(`${this.#context.type} "${this.#context.name}": Data Manager already initialized`)
    }
    
    this.#data = {
      bind: this.#createBinding,
      toJSON: this.#toJSON
    }

    Object.keys(this.#cfg ?? {}).forEach(key => this.add(key, this.#cfg[key]))
    this.#initialized = true
  }

  #toJSON = () => {
    const data = {
      ...this.#attached,
      ...this.#model.data,
      
      ...Object.keys(this.#models).reduce((models, model) => {
        models[model] = this.#models[model].data    
        delete models[model].id
        return models
      }, {}),

      ...Object.keys(this.#stores).reduce((stores, store) => {
        stores[store] = this.#stores[store].data
        // delete stores[store].id
        return stores
      }, {})
    }

    delete data.id
    return data
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

  #addField = (name, cfg) => {
    this.#fields.push(name)
    this.#model.addField(name, cfg)

    Object.defineProperty(this.#data, name, {
      get: () => this.#model[name],
      set: value => this.#setField(name, value)
    })
  }

  #addModel = (name, model) => {
    this.#models[name] = model

    Object.defineProperty(this.#data, name, {
      get: () => model,
      set: value => {
        throw new Error(`Cannot overwrite DataModel "${name}"`)
      }
    })

    this.#applyModelListeners(name, model)
  }

  #addStore = (name, store) => {
    this.#stores[name] = store

    Object.defineProperty(this.#data, name, {
      get: () => store,
      set: value => {
        throw new Error(`Cannot overwrite DataStore "${name}"`)
      }
    })

    this.#applyStoreListeners(name, store)
  }

  #applyModelListeners = (name, model) => {
    model.on('field.update', change => {
      if (change.old === change.new) {
        return
      }

      const update = {
        previous: change.old,
        current: change.new
      }

      this.#context.emit(`data${name ? `.${name}` : ''}.changed`, {
        name: change.field,
        ...update
      })

      this.#context.emit(`data${name ? `.${name}` : ''}.${change.field}.changed`, update)
    })

    // model.on('bind', (field, process) => {
    //   console.log('BIND TO DATA MODEL')
    //   console.log(field, process)
    // })
  }

  #applyStoreListeners = (name, store) => {
    store.on('record.create', record => {
      this.#context.emit(`data.${name}.record.created`, record.data)
    })

    store.on('record.delete', record => {
      this.#context.emit(`data.${name}.record.deleted`, record.data)
    })

    store.on('record.update', record => {
      this.#context.emit(`data.${name}.record.updated`, record.data)
    })

    store.on('clear', records => {
      this.#context.emit(`data.${name}.cleared`, [])
    })

    store.on('load', records => {
      this.#context.emit(`data.${name}.loaded`, records.map(record => record.data))
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

  #setField = (field, value) => {
    const change = new DataChange(field, {
      current: this.#model[field],
      next: value
    })

    this.#context.emit('data.change', {
      current: change.current,
      next: change.next,
      abort: () => change.abort()
    })

    if (!change.aborted) {
      this.#model[field] = value
    }
  }
}
