import DataModel from './DataModel.js'
import DataStore from './DataStore.js'
import DataChange from './DataChange.js'
import Constants from '../Constants.js'

export default class DataCollection {
  #context
  #fields = new DataModel({ autoid: true })
  #models = {}
  #stores = {}
  #attached = {}

  constructor (context, cfg) {
    this.#context = context
    this.#applyModelListeners(null, this.#fields)
    Object.keys(cfg).forEach(key => this.add(key, cfg[key]))
  }

  add (name, value) {
    if (Constants.DATA_RESERVEDNAMES.includes(name.toLowerCase())) {
      throw new Error(`Invalid data configuration: "${name}" is a reserved word`)
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
      if (Constants.DATA_RESERVEDNAMES.includes(key)) {
        throw new Error(`Invalid data configuration: "${key}" is a reserved word`)
      }

      this.#attached[key] = data[key]

      if (!this.hasOwnProperty(key)) {
        this[key] = data[key]
        return
      }

      const field = this[key]

      if (field instanceof DataModel || field instanceof DataStore) {
        field.load(data[key])
      } else {
        this[key] = data[key]
      }
    })
  }

  bind (field, process) {
    return this.#fields.bind(...arguments)
  }

  clearAttachments () {
    Object.keys(this.#attached).forEach(attachment => {
      delete this[attachment]
    })

    this.#attached = {}
  }

  toJSON () {
    const data = {
      ...this.#attached,
      ...this.#fields.data,

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

  #addField = (name, cfg) => {
    this.#fields.addField(name, cfg)

    Object.defineProperty(this, name, {
      get: () => this.#fields[name],
      set: value => this.#setField(name, value)
    })
  }

  #addModel = (name, model) => {
    this.#models[name] = model

    Object.defineProperty(this, name, {
      get: () => model,
      set: value => {
        throw new Error(`Cannot overwrite DataModel "${name}"`)
      }
    })

    this.#applyModelListeners(name, model)
  }

  #addStore = (name, store) => {
    this.#stores[name] = store

    Object.defineProperty(this, name, {
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

  #setField = (name, value) => {
    const change = new DataChange(name, {
      current: this.#fields[name],
      update: value
    })

    this.#context.emit('data.change', {
      current: change.current,
      update: change.update,
      abort: () => change.abort()
    })

    if (change.aborted) {
      return
    }

    this.#fields[name] = value

    this.#context.emit('data.changed', {
      previous: change.current,
      current: change.update
    })
  }
}