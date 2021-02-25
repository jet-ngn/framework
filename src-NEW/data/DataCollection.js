import DataChange from './DataChange.js'
import DataModel from './DataModel.js'
import DataStore from './DataStore.js'

export default class DataCollection {
  #context
  #model
  #fields = []
  #models = {}
  #stores = {}
  #reserved = ['bind']
  #attached = {}
  #data = {}
  #bindFn

  constructor (context, cfg, bindFn) {
    this.#context = context
    this.#model = new (NGN.DATA.Model({ autoid: true }))
    this.#data.bind = bindFn
    this.#applyModelListeners(null, this.#model)
    Object.keys(cfg ?? {}).forEach(key => this.add(key, cfg[key]))
  }

  get data () {
    return this.#data
  }

  add (name, value) {
    if (this.#reserved.includes(name)) {
      throw new Error(`Cannot store data field "${name}" because it is a reserved word`)
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

  clearAttachments() {
    Object.keys(this.#attached).forEach(attachment => {
      delete this.#data[attachment]
    })

    this.#attached = {}
  }

  getField (field) {
    return this.#model[field]
  }

  hasField (field) {
    return this.#fields.includes(field)
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

    model.on('bind', (field, process) => {
      console.log('BIND TO DATA MODEL')
      console.log(field, process)
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
      this.#model[field] = value
    }
  }
}

// export default class Data {
//   #context
//   #model
//   #attached = []
//   #fields = []
//   #models = {}
//   #stores = {}
//   #bindings = {
//     attributes: {},
//     interpolations: {}
//   }
//
//   #deferredBindings = {
//     attributes: {},
//     interpolations: {}
//   }
//
//   constructor (context, cfg) {
//     this.#context = context
//     this.#model = new (NGN.DATA.Model({ autoid: true }))
//     this.#applyModelListeners(null, this.#model)
//     Object.keys(cfg).forEach(key => this.add(key, cfg[key]))
//   }
//
//   get deferred () {
//     return this.#deferredBindings
//   }
//
//   add (name, value) {
//     if (name === 'bind') {
//       throw new Error(`Cannot store data field "bind" because it is a reserved word`)
//     }
//
//     if (value instanceof DataModel) {
//       return this.#addModel(name, value)
//     }
//
//     if (value instanceof DataStore) {
//       return this.#addStore(name, value)
//     }
//
//     this.#addField(name, value)
//   }
//
//   attach (key, value) {
//     this.#attached.push(key)
//     this[key] = value
//   }
//
//   bind (field, process) {
//     if (!this.hasOwnProperty(field)) {
//       throw new ReferenceError(`Data field "${field}" not found`)
//     }
//
//     if ([...Object.keys(this.#models), ...Object.keys(this.#stores)].includes(field)) {
//       throw new Error(`Cannot bind directly to DataStores or DataModels. Bind to a property within the DataModel or a property of a DataStore record instead.`)
//     }
//
//     return {
//       type: 'data',
//       field,
//       initialValue: process ? process(this[field]) : this[field],
//       bindAttribute: (element, name) => this.#bindAttribute(field, element, name, process),
//       bindInterpolation: (interpolation, defer = false) => this.#bindInterpolation(field, interpolation, process, defer)
//     }
//   }
//
//   toJSON () {
//     const json = {}
//
//     this.#attached.forEach(key => json[key] = this[key])
//     this.#fields.forEach(field => json[field] = this[field])
//
//     Object.keys(this.#models).forEach(model => {
//       json[model] = this.#models[model].representation
//     })
//
//     Object.keys(this.#stores).forEach(store => {
//       json[store] = this.#stores[store].data
//     })
//
//     return json
//   }
//
//   // TODO: Collapse this into a single event listener rather than one per binding
//   #addBindingListener = (collection, field, callback) => {
//     this.#context.on(`data.${field}.changed`, (evt, change) => {
//       const bindings = this.#bindings[collection][field]
//
//       for (let i = 0, length = bindings.length; i < length; i++) {
//         callback(bindings[i], change)
//       }
//     })
//   }
//
//   #addField = (name, cfg) => {
//     this.#fields.push(name)
//     this.#model.addField(name, cfg)
//
//     Object.defineProperty(this, name, {
//       get: () => this.#model[name],
//       set: value => this.#setField(name, value)
//     })
//   }
//
//   #addModel = (name, model) => {
//     this.#models[name] = model
//
//     Object.defineProperty(this, name, {
//       get: () => model,
//       set: value => {
//         throw new Error(`Cannot overwrite DataModel "${name}"`)
//       }
//     })
//
//     this.#applyModelListeners(name, model)
//   }
//
//   #addStore = (name, store) => {
//     this.#stores[name] = store
//
//     Object.defineProperty(this, name, {
//       get: () => store,
//       set: value => {
//         throw new Error(`Cannot overwrite DataStore "${name}"`)
//       }
//     })
//
//     this.#applyStoreListeners(name, store)
//   }
//
//   #applyModelListeners = (name, model) => {
//     model.on('field.update', change => {
//       if (change.old === change.new) {
//         return
//       }
//
//       const update = {
//         previous: change.old,
//         current: change.new
//       }
//
//       this.#context.emit(`data${name ? `.${name}` : ''}.changed`, {
//         name: change.field,
//         ...update
//       })
//
//       this.#context.emit(`data${name ? `.${name}` : ''}.${change.field}.changed`, update)
//     })
//
//     model.on('bind', (field, process) => {
//       console.log('BIND TO DATA MODEL')
//       console.log(field, process)
//     })
//   }
//
//   #applyStoreListeners = (name, store) => {
//     store.on('record.create', record => {
//       this.#context.emit(`data.${name}.record.created`, record.data)
//     })
//
//     store.on('record.delete', record => {
//       this.#context.emit(`data.${name}.record.deleted`, record.data)
//     })
//
//     store.on('record.update', record => {
//       this.#context.emit(`data.${name}.record.updated`, record.data)
//     })
//
//     store.on('clear', records => {
//       this.#context.emit(`data.${name}.cleared`, [])
//     })
//
//     store.on('load', records => {
//       this.#context.emit(`data.${name}.loaded`, records.map(record => record.data))
//     })
//   }
//
//   #bind = (collection, property, obj, cb) => {
//     collection = this.#bindings[collection]
//
//     if (!collection.hasOwnProperty(property)) {
//       collection[property] = [obj]
//       return cb(property)
//     }
//
//     collection[property].push(obj)
//   }
//
//   #bindAttribute = (field, element, attribute, process) => {
//     this.#bind('attributes', field, {
//       element,
//       attribute,
//       process: process ?? null
//     }, () => {
//       this.#addBindingListener('attributes', field, (binding, { previous, current }) => {
//         const { element, attribute, process } = binding
//
//         if (current !== previous) {
//           element.setAttribute(attribute, process ? process(current) : current)
//         }
//       })
//     })
//   }
//
//   #bindInterpolation = (field, interpolation, process, defer) => {
//     const cfg = {
//       interpolation,
//       process: process ?? null
//     }
//
//     if (defer) {
//       return this.#deferredBindings.interpolations[field] = cfg
//     }
//
//     this.#bind('interpolations', field, cfg, () => {
//       this.#addBindingListener('interpolations', field, (binding, { previous, current }) => {
//         const { interpolation, process } = binding
//
//         if (current !== previous) {
//           interpolation.update(process ? process(current) : current)
//         }
//       })
//     })
//   }
//
//   #setField = (field, value) => {
//     const change = new DataChange(field, {
//       current: this.#model[field],
//       next: value
//     })
//
//     this.#context.emit('data.change', {
//       current: change.current,
//       next: change.next,
//       abort: () => change.abort()
//     })
//
//     if (!change.aborted) {
//       this.#model[field] = value
//     }
//   }
// }
