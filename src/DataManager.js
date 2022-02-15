// import NGN from 'NGN'
import DataModel from './DataModel.js'
import DataStore from './DataStore.js'
import { forEachKey } from './utilities.js'

function applyModelListeners (context, name, model) {
  ;['change', 'revert', 'restore'].forEach(event => {
    model.on(`field.${event}`, function ({ field, from, to, ...rest }) {
      const payload = { from, to, ...rest }
  
      if (name) {
        context.emit(`data.${event}`, {
          model: name,
          field,
          ...payload
        })
  
        context.emit(`data.${name}.${event}`, { field, ...payload })
        context.emit(`data.${name}.${field}.${event}`, payload)
      } else {
        context.emit(`data.${event}`, { field, ...payload })
        context.emit(`data.${field}.${event}`, payload)
      }
    })
  })
}

function applyStoreListeners (context, name, store) {
  // ;['create', 'delete', 'update'].forEach(event => store.on(`record.${event}`, function ({ data }) {
  //   context.emit(`data.${name}.record.${event}`, data)
  // }))

  // store.on('clear', function (records) {
  //   context.emit(`data.${name}.clear`, records)
  // })
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

let data = null

export function initializeDataManager (target, cfg) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Invalid ${target.constructor.name} "data" configuration. Expected "object", received "${typeof cfg}"`)
  }

  data = new DataCollection(target, cfg)
}

export function attachDataManager (obj) {
  Object.defineProperty(obj.prototype, 'data', {
    get () {
      return data
    }
  })
}