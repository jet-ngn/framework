// import DataBinder from './DataBinder.js'
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

  constructor (context, fields) {
    this.#context = context
    this.#cfg = fields

    this.#model = new DataModel({ autoid: true })
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
      bind: (field, process) => this.#model.bind(field, process),
      toJSON: this.#toJSON
    }

    Object.keys(this.#cfg ?? {}).forEach(key => this.add(key, this.#cfg[key]))
    this.#initialized = true
  }

  #addField = (name, cfg) => {
    this.#fields.push(name)
    this.#model.addField(name, cfg)

    Object.defineProperty(this.#data, name, {
      get: () => this.#model.getField(name),
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
      this.#model.setField(field, value)
    }
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
}
