import { load, registerState } from '../DataRegistry'
import State, { getTarget } from './State'

export default class StateObject extends State {
  #model
  #properties
  #states

  constructor (obj, config = {}) {
    const { model = {}, states = {}, properties = {} } = config
    
    super(new Proxy(obj, {
      get: (target, property) => target[property],
  
      set: (target, property, value) => {
        const currentValue = target[property]
  
        if (currentValue === value) {
          return true
        }
  
        const { bindings, history, proxy } = this
  
        target[property] = value
        
        history.add({
          change: {
            property,
            value: {
              current: value,
              previous: currentValue
            }
          }
        })
  
        for (let binding of bindings) {
          binding.targets.includes(proxy) && binding.reconcile()
        }
  
        return true
      }
    }), config)

    this.#model = model
    this.#properties = properties
    this.#states = states

    this.#initialize()
  }

  #initialize () {
    for (let property in this.#properties) {
      this.#addProperty(property)
    }
    
    for (let state in this.#states) {
      this.proxy[state] = this.getProxy(this.#states[state])
    }
  }

  #addProperty (property) {
    this.proxy[property] = this.#properties[property]
  }

  clear () {
    this.removeChildProxies()

    for (let key of Object.keys(this.proxy)) {
      delete this.proxy[key]
    }

    this.#initialize()
  }

  load (data = {}) {
    if (typeof data !== 'object') {
      throw new TypeError(`Cannot load data of type "${data.constructor.name.toLowerCase()}" into Data State Object${!!this.name ? ` "${this.name}."` : ''}`)
    }

    this.removeChildProxies()

    const keys = [...(new Set([...Object.keys(this.proxy), ...Object.keys(data ?? {}), ...Object.keys(this.#states), ...Object.keys(this.#properties)]))]

    for (let [index, key] of keys.entries()) {
      if (data.hasOwnProperty(key)) {
        if (this.#states.hasOwnProperty(key)) {
          const proxy = this.getProxy(this.#states[key])
          const content = data[key] ?? null

          this.proxy[key] = proxy
          load(proxy, content)
          continue
        }
        
        this.proxy[key] = data[key]
        continue
      }

      if (this.#states.hasOwnProperty(key)) {
        this.addChildProxy(this.getProxy(this.#states[key]))
        continue
      }

      if (this.#properties.hasOwnProperty(key)) {
        this.#addProperty(key)
        continue
      }

      delete this.proxy[key]
    }
  }
}