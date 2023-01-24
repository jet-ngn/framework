import State from './State'
import { load } from './index'
import { runTasks } from '../lib/TaskRunner'
import { emitInternal } from '../events/InternalBus'

export default class StateObject extends State {
  #changeHandlers = new Map
  #batching = false
  #batchedTasks = new Map
  #property = null

  constructor (obj, model = null, meta = null) {
    super(model, meta, new Proxy(obj, {
      get: (target, property) => target[property],
  
      set: (target, property, value) => {
        const currentValue = target[property]
  
        if (currentValue === value) {
          return true
        }
  
        const { bindings, history, proxy } = this
  
        target[property] = value
        history.add({ property })

        const tasks = this.#getBindingUpdateTask(proxy, bindings, property)

        if (this.#batching) {
          this.#batchedTasks.set(property, tasks)
        } else {
          runTasks(tasks, {
            callback: () => this.#updateCallback(property)
          })
        }

        return true
      }
    }))

    this.#initialize(obj)
  }

  #updateCallback (property) {
    const changeHandlers = this.#changeHandlers.get(property) ?? []
      
    if (changeHandlers.length) {
      const [previous, current] = this.history.getAfter(-2)
      
      const payload = {
        previous: previous.value[property],
        current: current.value[property]
      }

      changeHandlers.forEach(changeHandler => changeHandler(payload))
    }
  }

  clear () {
    this.removeChildProxies()

    for (let key of Object.keys(this.proxy)) {
      delete this.proxy[key]
    }

    this.#initialize()
  }

  load (data = {}) {
    console.log('LOAD STATE OBJECT')
    // if (typeof data !== 'object') {
    //   throw new TypeError(`Cannot load data of type "${data.constructor.name.toLowerCase()}" into Data State Object${!!this.name ? ` "${this.name}."` : ''}`)
    // }

    // this.removeChildProxies()

    // const keys = [...(new Set([...Object.keys(this.proxy), ...Object.keys(data ?? {}), ...Object.keys(this.#states), ...Object.keys(this.#properties)]))]

    // for (let [index, key] of keys.entries()) {
    //   if (data.hasOwnProperty(key)) {
    //     if (this.#states.hasOwnProperty(key)) {
    //       const proxy = this.getProxy(this.#states[key])
    //       const content = data[key] ?? null

    //       this.proxy[key] = proxy
    //       load(proxy, content)
    //       continue
    //     }
        
    //     this.proxy[key] = data[key]
    //     continue
    //   }

    //   if (this.#states.hasOwnProperty(key)) {
    //     this.addChildProxy(this.getProxy(this.#states[key]))
    //     continue
    //   }

    //   if (this.#properties.hasOwnProperty(key)) {
    //     this.#addProperty(key)
    //     continue
    //   }

    //   delete this.proxy[key]
    // }
  }

  registerChangeHandler (property, callback) {
    const entry = this.#changeHandlers.get(property)

    if (!entry) {
      return this.#changeHandlers.set(property, [callback])
    }

    entry.push(callback)
  }

  update (data = {}) {
    this.#batching = true

    for (const key of Object.keys(data)) {
      this.proxy[key] = data[key]
    }

    for (const [property, tasks] of this.#batchedTasks) {
      runTasks(tasks, {
        callback: () => {
          this.#updateCallback(property)
        }
      })
    }

    this.#batching = false
    this.#batchedTasks.clear()
  }

  #initialize (data) {
    const { model } = this

    if (!model) {
      return
    }

    for (const property of Object.keys(model)) {
      const value = model[property]
      const initial = data[property]

      if (Array.isArray(value)) {
        const proxy = this.addChildProxy(this.getProxy(...value))
        data[property] = proxy

        if (initial) {
          console.log('LOAD INITIAL DATA')
          // load(proxy, initial)
        }

        continue
      }

      if (!initial) {
        data[property] = this.getDefaultPropertyValue(property, model)
      }
    }
  }

  * #getBindingUpdateTask (proxy, bindings, property) {
    yield [`Reconcile State Object Bindings`, async ({ next }) => {
      await Promise.allSettled(bindings.map(async binding => {
        await this.#reconcileBinding(proxy, binding, property)
      }))

      next()
    }]
  }

  async #reconcileBinding (proxy, binding, property) {
    const properties = binding.proxies.get(proxy)

    if (properties.length === 0 || properties.includes(property)) {
      await binding.reconcile()
    }

    for (const child of binding.children ?? []) {
      await this.#reconcileBinding(proxy, child, property)
    }
  }
}