import State, { initChildState } from './State'

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
            model
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
  }

  load (data) {
    const { proxy } = this
    
    data = !data ? [] : Array.isArray(data) ? data : [data]
    this.removeChildProxies()
    
    const { type, states } = this.#childConfig

    if (!!type) {
      for (let entry of data) {
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

    return proxy.splice(0, proxy.length, ...data)
  }
}

function getArrayMethodHandler (state, target, property, method, { reconcile = false, model = null, index = null } = {}) {
  return (...args) => {
    !!model && validateArray(args.slice(index ?? 0), model)

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