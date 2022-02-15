import DataModel from './DataModel.js'
import DataStore from './DataStore.js'
import { forEachKey } from './utilities.js'

export function initializeDataManager (target, cfg) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Invalid ${target.constructor.name} "data" configuration. Expected "object", received "${typeof cfg}"`)
  }

  let data = new DataCollection(target, cfg)

  Object.defineProperty(target, 'data', {
    get: () => data
  })
}

function applyModelListeners (context, name, model) {
  model.on('load', function (data) {
    context.emit(`data.load`, { model: name, data })
    context.emit(`data.${name}.load`, data)
  })

  model.on(`field.change`, function ({ field, from, to, ...rest }) {
    const payload = { from, to, ...rest }

    if (name) {
      context.emit(`data.change`, {
        model: name,
        field,
        ...payload
      })

      context.emit(`data.${name}.change`, { field, ...payload })
      context.emit(`data.${name}.${field}.change`, payload)
    } else {
      context.emit(`data.change`, { field, ...payload })
      context.emit(`data.${field}.change`, payload)
    }
  })
}

function applyStoreListeners (context, name, store) {
  store.on('load', function (records) {
    context.emit(`data.load`, { store: name, records })
    context.emit(`data.${name}.load`, records)
  })

  ;['create', 'delete', 'change'].forEach(event => {
    store.on(`record.${event}`, function () {
      context.emit(`data.record.${event}`, { store: name, ...arguments[0] })
      context.emit(`data.${name}.record.${event}`, arguments[0])
    })
  })

  store.on('clear', function (records) {
    context.emit(`data.${name}.clear`, records)
  })
}

function convertToJSON (obj) {
  return Object.keys(obj).reduce((json, name) => {
    json[name] = obj[name].toJSON
    return json
  }, {})
}

class DataCollection {
  #context
  #fields = new DataModel
  #models = {}
  #stores = {}
  #attached = {}

  constructor (context, cfg) {
    this.#context = context
    applyModelListeners(context, null, this.#fields)
    forEachKey(cfg, this.add.bind(this))
  }

  get toJSON () {
    return {
      ...this.#fields.toJSON,
      ...convertToJSON(this.#models),
      ...convertToJSON(this.#stores)
    }
  }

  add (name, cfg) {
    if (cfg instanceof DataModel) {
      return this.#addModel(...arguments)
    }

    if (cfg instanceof DataStore) {
      return this.#addStore(...arguments)
    }

    const field = this.#fields.addField(name, cfg)

    Object.defineProperty(this, name, {
      get: () => field.value,
      set: value => field.value = value
    })
  }

  #addCollection = (name, obj) => Object.defineProperty(this, name, {
    get: () => obj,
    set: value => {
      throw new Error(`Cannot overwrite ${obj.constructor.name} "${name}"`)
    }
  })

  #addModel = (name, model) => {
    this.#models[name] = model
    this.#addCollection(name, model)
    applyModelListeners(this.#context, name, model)
  }

  #addStore = (name, store) => {
    this.#stores[name] = store
    this.#addCollection(name, store)
    applyStoreListeners(this.#context, name, store)
  }
}