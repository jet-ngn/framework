import State, { initChildState } from './State'

export default class StateObject extends State {
  #model
  #states
  #update = true

  constructor (obj, config = {}) {
    const { model = null, states = null } = config
    
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

    this.#states = states
    this.#model = model
  }

  clear () {
    this.removeChildProxies()

    for (let key of Object.keys(this.proxy)) {
      delete this.proxy[key]
    }
  }

  load (data) {
    this.#update = false
    const { proxy } = this

    if (typeof data !== 'object') {
      throw new TypeError(`Cannot load data of type "${data.constructor.name.toLowerCase()}" into Data State Object${!!this.name ? ` "${this.name}."` : ''}`)
    }

    this.removeChildProxies()

    const keys = [...(new Set([...Object.keys(this.proxy), ...Object.keys(data ?? {})]))]

    for (let [index, key] of keys.entries()) {
      if (!data || !data.hasOwnProperty(key)) {
        delete this.proxy[key]
        continue
      }

      if (!!this.#states) {
        for (let state in this.#states) {
          if (this.#states.hasOwnProperty(key)) {
            initChildState(this, data, this.#states, key)
          }
        }
      }

      if (index === keys.length - 1) {
        this.#update = true
      }

      this.proxy[key] = data[key]
    }
  }
}