import DataBindingInterpolation from './DataBindingInterpolation'
import AttributeBinding from './bindings/AttributeBinding'
import AttributeListBinding from './bindings/AttributeListBinding'
import AttributeListBooleanBinding from './bindings/AttributeListBooleanBinding'
import ContentBinding from './bindings/ContentBinding'
import PropertyBinding from './bindings/PropertyBinding'
import ViewBinding from './bindings/ViewBinding'
import { ViewPermissions } from '../../View'

export const states = new Map
const proxies = []

export function bind (...targets) {
  let transform = targets.pop()
  return new DataBindingInterpolation(targets, transform)
}

export function registerAttributeBinding (view, node, name, interpolation) {
  return registerBinding(new AttributeBinding(...arguments))
}

export function registerAttributeListBinding (view, list, interpolation) {
  return registerBinding(new AttributeListBinding(...arguments))
}

export function registerAttributeListBooleanBinding (view, list, name, interpolation) {
  return registerBinding(new AttributeListBooleanBinding(...arguments))
}

export function registerContentBinding (view, node, interpolation, retainFormatting) {
  return registerBinding(new ContentBinding(...arguments))
}

export function registerPropertyBinding (view, node, name, interpolation) {
  return registerBinding(new PropertyBinding(...arguments))
}

export function registerViewBinding (view, node, interpolation) {
  return registerBinding(new ViewBinding(...arguments))
}

export function registerState (target, model) {
  return states.has(target) ? states.get(target).revocable.proxy : processTarget(...arguments)
}

export function removeBindings () {
  for (let [key, value] of states) {
    value.bindings = []
    const { proxy } = value.revocable

    if (proxy instanceof ViewPermissions) {
      states.delete(key)
      proxies.splice(proxies.indexOf(proxy), 1)
    }
  }
}

export function removeBindingsByView (view) {
  for (let [key, value] of states) {
    value.bindings = value.bindings.reduce((result, binding) => binding.view === view ? result : [...result, binding], [])
  }
}

export function logBindings () {
  console.log(states);
  console.log([...states].reduce((result, [key, { bindings }]) => [...result, ...bindings], []))
}

export function load (state, data) {
  if (Array.isArray(state)) {
    Array.isArray(data) && data.length > 0 && state.splice(0, state.length, ...(Array.isArray(data) ? data : [data]))
    // if (Array.isArray(data) && data.length > 0) {
    //   state.length = data.length

    //   for (let i = 0; i < data.length; i++) {
    //     state[i] = data[i]
    //   }
    // }

    return
  }

  for (let key of Object.keys(state)) {
    const existing = state[key]
    
    if (proxies.includes(existing)) {
      load(existing, data[key])
      continue
    }

    state[key] = data[key] ?? null
  }
}

export function append (state, data) {
  if (Array.isArray(state)) {
    return state.push(...(Array.isArray(data) ? data : [data]))
  }

  for (let key of Object.keys(data)) {
    if (!Reflect.ownKeys(state).includes(key)) {
      state[key] = data[key]
    }
  }
}

function validateArray (arr, model) {
  arr.forEach(entry => {
    if (typeof model === 'object') {
      return validateObject(entry, model)
    } else if (entry.constructor !== model) {
      throw new Error(getArrayTypeMismatchErrorMessage(entry, model))
    }
  })
}

function validateObject (obj = {}, model = {}) {
  Object.keys(model).forEach(key => {
    const config = model[key]

    if (proxies.includes(config)) {
      !!obj[key] && load(config, obj[key])
      obj[key] = config
      return
    }

    let type = config,
        defaultValue = null

    if (typeof config === 'object') {
      type = config.type
      defaultValue = config.default ?? null
    }

    if (!obj.hasOwnProperty(key)) {
      obj[key] = defaultValue
    }

    const value = obj[key]

    if (![undefined, null].includes(value) && value.constructor !== type) {
      throw new TypeError(getObjectTypeMismatchErrorMessage(model, key, value))
    }
  })
}

function getArrayMethodHandler (target, property, method, { reconcile = false, model = null, index = null } = {}) {
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

    const { bindings, changes } = states.get(target) ?? {}
    const output = method.apply(target, args)

    change.value.current = [...target]
    changes.push(change)

    for (let binding of bindings) {
      binding.reconcile(reconcile ? undefined : property)
    }

    return output
  }
}

function getArrayTypeMismatchErrorMessage (entry, type) {
  return `Data State Array expected entry of type "${(new type()).constructor.name.toLowerCase()}," received "${typeof entry}."`
}

function getArrayProxy (arr, model) {
  !!model && validateArray(...arguments)

  return Proxy.revocable(arr, {
    get: (target, property) => {
      switch (property) {
        case 'push':
        case 'fill': return getArrayMethodHandler(target, property, target[property], {
          reconcile: false,
          model
        })

        case 'copyWithin':
        case 'pop':
        case 'reverse':
        case 'sort':
        case 'shift':
        case 'unshift': return getArrayMethodHandler(target, property, target[property], {
          reconcile: true
        })

        case 'splice': return getArrayMethodHandler(target, property, target[property], {
          reconcile: true,
          model,
          index: 2
        })
      
        default: return target[property]
      }
    }
  })
}

// function getMapProxy (map) {
//   console.log('PROXY', map)
// }

function getObjectTypeMismatchErrorMessage (model, property, value) {
  return `Property "${property}" value (type "${typeof value}") does not match the type "${(new model[property]()).constructor.name.toLowerCase()}" as specified in the model.`
}

function getObjectProxy (obj, model = null) {
  if (!!model) {
    validateObject(...arguments)
  }

  return Proxy.revocable(obj, {
    get: (target, property) => target[property],

    set: (target, property, value) => {
      const currentValue = target[property]

      if (currentValue === value) {
        return true
      }

      const { bindings, changes, revocable } = states.get(target)

      changes.push({
        timestamp: Date.now(),
        property,
        value: {
          previous: currentValue,
          current: value
        }
      })

      target[property] = value

      bindings.forEach(binding => {
        const { targets } = binding

        if (targets.includes(revocable.proxy)) {
          binding.reconcile()
        }
      })

      return true
    }
  })
}

function getStateByProxy (proxy) {
  return [...states.values()].find(({ revocable }) => revocable.proxy === proxy)
}

// function getSetProxy (state) {
//   console.log('PROXY', state)
// }

function processTarget (target, model) {
  if (typeof target !== 'object') {
    throw new TypeError(`Data States must be initialized with Object, Array, Map or Set primitives`)
  }

  let isProxy = true
  let revocable

  if (!target) {
    isProxy = false
  } else if (Array.isArray(target)) {
    revocable = getArrayProxy(...arguments)
  // } else if (target instanceof Map) {
  //   revocable = getMapProxy(...arguments)
  // } else if (target instanceof Set) {
  //   revocable = getSetProxy(...arguments)
  } else if (typeof target === 'object') {
    revocable = getObjectProxy(...arguments)
  } else {
    isProxy = false
  }

  if (isProxy) {
    const state = states.get(target)

    if (state) {
      return state.revocable.proxy
    }

    states.set(target, {
      revocable,
      bindings: [],
      changes: []
    })

    proxies.push(revocable.proxy)
    return revocable.proxy
  }

  return target
}

function registerBinding (binding) {
  binding.targets.forEach(target => {
    const state = getStateByProxy(target)

    if (!state) {
      // registerState(target, )
      throw new ReferenceError(`Cannot bind to unregistered Data State`)
    }

    state.bindings.push(binding)
  })

  return binding
}

