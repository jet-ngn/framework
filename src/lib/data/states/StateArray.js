import State from './State'
import { load } from '../DataRegistry'
import { runTasks } from '../../TaskRunner'

export default class StateArray extends State {
  #childConfig

  constructor (arr, config = {}) {
    const { model = {}, states = {}, properties = {} } = config
    const initial = [...arr]
    arr.splice(0, arr.length)

    super(new Proxy(arr, {
      get: (target, property) => {
        switch (property) {
          case 'push':
          case 'fill':
          case 'pop':
          case 'shift': 
          case 'unshift': return this.#getArrayMethodHandler(target, property, target[property], {
            reconcile: false,
            model,
            index: 0
          })
        
          case 'copyWithin':
          case 'reverse':
          case 'sort': return this.#getArrayMethodHandler(target, property, target[property], {
            reconcile: true
          })

          case 'splice': return this.#getArrayMethodHandler(target, property, target[property], {
            reconcile: true,
            model,
            index: 2
          })
        
          default: return target[property]
        }
      }
    }), config)

    this.#childConfig = { model, states, properties, isState: false }

    if (Array.isArray(config)) {
      this.#childConfig = {
        ...this.#childConfig,
        isState: true,
        config
      }
    }

    this.load(initial)
  }

  get childConfig () {
    return this.#childConfig
  }

  append (data) {
    return this.proxy.push(...this.#processData(data))
  }

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

    const { isState } = this.#childConfig

    if (!isState) {
      return data
    }

    for (let entry of data) {
      if (isState) {
        const { config } = this.#childConfig
        const proxy = this.getProxy(config)

        this.addChildProxy(proxy)
        load(proxy, entry)
        data.splice(data.indexOf(entry), 1, proxy)

        continue
      }

      if (entry.constructor !== type) {
        throw new TypeError(`Data State Array${this.name ? ` "${this.name}"` : ''} expected value of type "${(new type()).constructor.name.toLowerCase()}," received "${entry.constructor.name.toLowerCase()}"`)
      }
    }

    return data
  }

  #getArrayMethodHandler (target, property, method, { reconcile = false, model = null, index = null } = {}) {
    return (...args) => {
      const additive = index !== null
      
      if (additive) {
        const { type, config } = this.childConfig
  
        if (type === State) {
          args = args.map((arg, i) => {
            if (i < index) {
              return arg
            }
  
            const proxy = this.getProxy(config)
            this.addChildProxy(proxy)
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
  
      const { bindings, history } = this
      const output = method.apply(target, args)
  
      change.value.current = [...target]
      history.add(change)
  
      runTasks(getBindingUpdateTasks(bindings, reconcile ? undefined : property))
      return output
    }
  }
}

function * getBindingUpdateTasks (bindings, method) {
  for (let binding of bindings) {
    yield * binding.getReconciliationTasks({ method })
  }
}