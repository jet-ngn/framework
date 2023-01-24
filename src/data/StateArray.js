import State from './State'
import { load } from './index'
import { runTasks } from '../lib/TaskRunner'
import { logBindings } from './DataRegistry'

/**
 * @class StateArray
 * A bindable array. Instances are created using StateFactory.
 */

export default class StateArray extends State {
  #changeHandlers = new Set
  #invalidEntries = new Map
  #initialized = false

  constructor (arr, model = null, meta = null) {
    super(model, meta, new Proxy(arr, {
      get: (target, property) => {
        const args = [target, property, target[property]]

        switch (property) {
          case 'push':
          case 'fill':
          case 'pop':
          case 'shift': 
          case 'unshift': return this.#getArrayMethodHandler(...[...args, {
            reconcile: false,
            index: 0
          }])
        
          case 'copyWithin':
          case 'reverse':
          case 'sort': return this.#getArrayMethodHandler(...[...args, {
            reconcile: true
          }])
    
          case 'splice': return this.#getArrayMethodHandler(...[...args, {
            reconcile: true,
            index: 2
          }])
        
          default: return target[property]
        }
      }
    }))

    this.history.add()
    this.load(arr)
    this.#initialized = true
  }

  clear () {
    return this.load()
  }

  load (data = []) {
    const { proxy } = this
    this.removeChildProxies()
    proxy.splice(0, proxy.length, ...this.#processData(data))
  }

  registerChangeHandler (callback) {
    this.#changeHandlers.add(callback)
  }

  #getArrayMethodHandler (target, property, method, { reconcile = false, index = null } = {}) {
    return (...args) => {
      const additive = index !== null
      
      if (additive && this.#initialized) {
        args = args.map((arg, i) => i < index ? arg : this.#processDataEntry(arg))
      }
  
      const { bindings, history } = this
      const output = method.apply(target, args)

      if (this.#initialized) {
        history.add({ action: property })
      }
  
      runTasks(getBindingUpdateTask(bindings, reconcile ? undefined : property), {
        callback: () => {
          if (this.#changeHandlers.size > 0) {
            const [previous, current] = history.getAfter(-2)
            this.#changeHandlers.forEach(handler => handler({ previous, current }))
          }
        }
      })

      return output
    }
  }

  #processData (data) {
    data = [...(!data ? [] : Array.isArray(data) ? data : [data])]

    for (let [index, entry] of data.entries()) {
      data.splice(index, 1, this.#processDataEntry(entry))
    }

    return data
  }

  #processDataEntry (entry) {
    return this.addChildProxy(this.getProxy(entry, this.model))
  }
}

function * getBindingUpdateTask (bindings, method) {
  yield [`Reconcile State Array Bindings`, async ({ next }) => {
    for (const binding of bindings) {
      await binding.reconcile(false, method)
    }

    next()
  }]
}

// #validateEntry (data, entry, index) {
  //   if (this.model === Array) {
  //     return console.log('CREATE NEW CHILD STATE')
  //     // return Array.isArray(entry) ?  : this.#invalidEntries.set(index, entry)
  //   }

  //   switch (this.model) {
  //     case String: 
  //     case Number:
  //     case Object:
  //     case Map:
  //     case Set: return !(entry instanceof this.model) && this.#invalidEntries.set(index, entry, `Entry type does not match the specified type "${this.model.name}"`)
  //   }
    
  //   if (typeof this.model !== 'object') {
  //     throw new Error(`Invalid State Array model type "${typeof this.model}"`)
  //   }
    
  //   if (typeof entry !== 'object') {
  //     return this.#invalidEntries.set(index, entry, `Entry type does not match the specified type "Object"`)
  //   }

  //   for (const property of Object.keys(this.model)) {
  //     const model = this.model[property]
  //     const value = entry[property]
  //     model && value && this.#processEntryProperty(index, entry, property, value, model)
  //   }
  // }

  // #validateEntryProperty (index, entry, property, value, model) {
  //   if (model === Array) {
  //     return !Array.isArray(entry) && this.#invalidEntries.set(index, entry, `Entry property "${property}" value type "${typeof value}" does not match the specified type "Array"`)
  //   }

  //   switch (model) {
  //     case String:
  //     case Number:
  //     case Object:
  //     case Map:
  //     case Set: return !(entry instanceof model) && this.#invalidEntries.set(index, entry, `Entry property "${property}" value type "${typeof value}" does not match the specified type "${model.name}"`)
  //   }

  //   if (typeof model !== 'object') {
  //     throw new Error(`Invalid State Array Entry property "${property}" model type "${typeof model}"`)
  //   }

  //   if (typeof value !== 'object') {
  //     return this.#invalidEntries.set(index, entry, `Entry property "${property}" value type "${typeof value}" does not match the specified type "Object"`)
  //   }
  // }