import { load, registerState } from '../DataRegistry'
import State, { getTarget } from './State'

export default class StateObject extends State {
  #model
  #properties
  #states
  #update = true

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

        if (!this.#update) {
          return true
        }
        
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
  }

  clear () {
    this.removeChildProxies()

    for (let key of Object.keys(this.proxy)) {
      delete this.proxy[key]
    }
  }

  load (data = {}) {
    this.#update = false

    if (typeof data !== 'object') {
      throw new TypeError(`Cannot load data of type "${data.constructor.name.toLowerCase()}" into Data State Object${!!this.name ? ` "${this.name}."` : ''}`)
    }

    this.removeChildProxies()

    const keys = [...(new Set([...Object.keys(this.proxy), ...Object.keys(data ?? {}), ...Object.keys(this.#states), ...Object.keys(this.#properties)]))]

    for (let [index, key] of keys.entries()) {
      if (index === keys.length - 1) {
        this.#update = true
      }

      if (data.hasOwnProperty(key)) {
        if (this.#states.hasOwnProperty(key)) {
          const config = this.#states[key]
          const content = data[key] ?? null
          const proxy = registerState(getTarget(config[0]), ...config.slice(1))

          this.addChildProxy(proxy)
          this.proxy[key] = proxy
          load(proxy, content)
          continue
        }
        
        this.proxy[key] = data[key]
        continue
      }

      if (this.#states.hasOwnProperty(key)) {
        const [initial, config] = this.#states[key]
        const proxy = registerState(getTarget(initial), config)
        this.addChildProxy(proxy)
        this.proxy[key] = proxy
        continue
      }

      if (this.#properties.hasOwnProperty(key)) {
        this.proxy[key] = this.#properties[key]
        continue
      }

      delete this.proxy[key]
    }
  }

  // load (data) {
  //   this.#update = false

  //   if (typeof data !== 'object') {
  //     throw new TypeError(`Cannot load data of type "${data.constructor.name.toLowerCase()}" into Data State Object${!!this.name ? ` "${this.name}."` : ''}`)
  //   }

  //   this.removeChildProxies()

  //   const keys = [...(new Set([...Object.keys(this.proxy), ...Object.keys(data ?? {})]))]

  //   for (let [index, key] of keys.entries()) {
  //     if (!data || !data.hasOwnProperty(key)) {
  //       delete this.proxy[key]
  //       continue
  //     }

  //     if (!!this.#states && this.#states.hasOwnProperty(key)) {
  //       initChildState(this, data, this.#states, key)
  //     }

  //     if (index === keys.length - 1) {
  //       this.#update = true
  //     }

  //     this.proxy[key] = data[key]
  //   }

  //   // Add empty child states if they do not exist in the data
  //   for (let state in this.#states) {
  //     if (!this.proxy.hasOwnProperty(state)) {
  //       const [initial, config] = this.#states[state]
  //       const proxy = registerState(initial, config)
  //       this.addChildProxy(proxy)
  //       this.proxy[state] = proxy
  //     }
  //   }
  // }
}