import { load, registerState } from '../DataRegistry'
import State, { initChildState, getTarget } from './State'

export default class StateArray extends State {
  #childConfig

  constructor (arr, config = {}) {
    const { type = null, model = null, states = null } = config

    super(new Proxy(arr, {
      get: (target, property) => {
        switch (property) {
          case 'push':
          case 'fill': return getArrayMethodHandler(this, target, property, target[property], {
            reconcile: false,
            model,
            index: 0
          })
        
          case 'copyWithin':
          case 'pop':
          case 'reverse':
          case 'sort':
          case 'shift':
          case 'unshift': return getArrayMethodHandler(this, target, property, target[property], {
            reconcile: true
          })

          case 'splice': return getArrayMethodHandler(this, target, property, target[property], {
            reconcile: true,
            model,
            index: 2
          })
        
          default: return target[property]
        }
      }
    }), config)

    this.#childConfig = { type, model, states }

    if (Array.isArray(config)) {
      this.#childConfig = {
        ...this.#childConfig,
        type: State,
        config
      }
    }
  }

  get childConfig () {
    return this.#childConfig
  }

  // append (data) {
  //   return this.proxy.push(...this.#processData(data))
  // }

  clear () {
    return this.load([])
  }

  load (data) {
    const { proxy } = this
    this.removeChildProxies()
    return proxy.splice(0, proxy.length, ...this.#processData(data))
  }

  #processData (data) {
    data = !data ? [] : Array.isArray(data) ? data : [data]

    const { type, states } = this.#childConfig

    if (!!type) {
      for (let entry of data) {
        if (type === State) {
          const { config } = this.#childConfig
          config[0] = getTarget(config[0])

          const proxy = registerState(...config)
          this.addChildProxy(proxy)
          load(proxy, entry)
          data.splice(data.indexOf(entry), 1, proxy)

          continue
        }

        if (entry.constructor !== type) {
          throw new TypeError(`Data State Array${this.name ? ` "${this.name}"` : ''} expected value of type "${(new type()).constructor.name.toLowerCase()}," received "${entry.constructor.name.toLowerCase()}"`)
        }

        if (type === Object) {
          if (!!states) {
            for (let key in states) {
              if (states.hasOwnProperty(key)) {
                initChildState(this, entry, states, key)
              }
            }
          }
        }
      }
    }

    return data
  }
}

function getArrayMethodHandler (state, target, property, method, { reconcile = false, model = null, index = null } = {}) {
  return (...args) => {
    const additive = index !== null
    
    if (additive) {
      const { type, config } = state.childConfig

      if (type === State) {
        args = args.map((arg, i) => {
          if (i < index) {
            return arg
          }

          config[0] = getTarget(config[0])

          const proxy = registerState(...config)
          state.addChildProxy(proxy)
          load(proxy, arg)
          return proxy
        })
      }
    }

    const change = {
      timestamp: Date.now(),
      action: property,

      value: {
        previous: [...target],
        current: null
      }
    }

    const { bindings, history } = state
    const output = method.apply(target, args)

    change.value.current = [...target]
    history.add(change)

    for (let binding of bindings) {
      binding.reconcile(reconcile ? undefined : property)
    }

    return output
  }
}