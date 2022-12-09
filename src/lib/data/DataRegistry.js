import DataBindingInterpolation from './DataBindingInterpolation'
import AttributeBinding from './bindings/AttributeBinding'
import AttributeListBinding from './bindings/AttributeListBinding'
import AttributeListBooleanBinding from './bindings/AttributeListBooleanBinding'
import ContentBinding from './bindings/ContentBinding'
import PropertyBinding from './bindings/PropertyBinding'
import ViewBinding from './bindings/ViewBinding'
import { ViewPermissions } from '../../View'
import StateArray from './states/StateArray'
import StateObject from './states/StateObject'

export const states = new Map

export function append (proxy, data) {
  console.log('TODO: Add append feature')
  // const state = getStateByProxy(proxy)
  // state.append(data)
}

export function bind (...targets) {
  let transform = targets.pop()
  return new DataBindingInterpolation(targets, transform)
}

export function clear (proxy) {
  const state = getStateByProxy(proxy)
  state.clear()
}

export function getStateByProxy (proxy) {
  return [...states.values()].find(state => state.proxy === proxy)
}

export function load (proxy, data) {
  const state = getStateByProxy(proxy)
  state.load(data)
}

export function logBindings () {
  console.log(states);
  console.log([...states].reduce((result, [key, { bindings }]) => [...result, ...bindings], []))
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

export function registerState (target, config) {
  let state = states.get(target)

  if (!state) {
    // throw new Error(`A Data State has already been mapped to the specified target`)

    if (typeof target !== 'object') {
      console.log(target);
      throw new TypeError(`Data States must be initialized with Object, Array, Map or Set primitives`)
    }
  
    state = makeState(...arguments)
    states.set(target, state)
  }

  return state.proxy
}

export function removeBindings () {
  for (let [key, state] of states) {
    state.clearBindings()
    const { proxy } = state

    if (proxy instanceof ViewPermissions) {
      state.removeChildProxies()
      states.delete(key)
    }
  }
}

export function removeBindingsByView (view) {
  for (let [key, state] of states) {
    state.removeBindingsByView(view)
  }
}

export function removeStateByProxy (proxy) {
  const state = getStateByProxy(proxy)
  states.delete(state)
}

function makeState (target, type, config) {
  if (Array.isArray(target)) {
    return new StateArray(...arguments)
  }

  if (typeof target === 'object') {
    return new StateObject(...arguments)
  }

  throw new TypeError(`Data States do not currently support "${target.constructor.name}" primitives.`)
}

function registerBinding (binding) {
  binding.targets.forEach(target => {
    const state = getStateByProxy(target)

    if (!state) {
      throw new ReferenceError(`Cannot bind to unregistered Data State`)
    }

    state.addBinding(binding)
  })

  return binding
}

// export function load (state, data) {
//   if (Array.isArray(state)) {
//     const append = !data ? [] : Array.isArray(data) ? data : [data]
//     return state.splice(0, state.length, ...append)
//   }

//   const { model } = getStateByProxy(state)

//   if (!model) {
//     for (let key of [...(new Set([...Object.keys(state), ...Object.keys(data ?? {})]))]) {
//       if (!data || !data.hasOwnProperty(key)) {
//         delete state[key]
//         continue
//       }

//       state[key] = data[key]
//     }

//     return
//   }

//   for (let key of Object.keys(state)) {
//     const existing = state[key]
    
//     if (proxies.includes(existing)) {
//       load(existing, data[key])
//       continue
//     }

//     state[key] = !data ? null : data[key] ?? existing ?? null
//   }
// }

// export function append (state, data) {
//   if (Array.isArray(state)) {
//     return state.push(...(Array.isArray(data) ? data : [data]))
//   }

//   for (let key of Object.keys(data)) {
//     if (!Reflect.ownKeys(state).includes(key)) {
//       state[key] = data[key]
//     }
//   }
// }

// function validateArray (arr, model) {
//   arr.forEach(entry => {
//     if (typeof model === 'object') {
//       return validateObject(entry, model)
//     } else if (entry.constructor !== model) {
//       throw new Error(getArrayTypeMismatchErrorMessage(entry, model))
//     }
//   })
// }

// function validateObject (obj = {}, model = {}) {
//   Object.keys(model).forEach(key => {
//     const config = model[key]

//     if (proxies.includes(config)) {
//       !!obj[key] && load(config, obj[key])
//       obj[key] = config
//       return
//     }

//     let type = config,
//         defaultValue = null

//     if (typeof config === 'object') {
//       type = config.type
//       defaultValue = config.default ?? null
//     }

//     if (!obj.hasOwnProperty(key)) {
//       obj[key] = defaultValue
//     }

//     const value = obj[key]

//     if (![undefined, null].includes(value) && value.constructor !== type) {
//       throw new TypeError(getObjectTypeMismatchErrorMessage(model, key, value))
//     }
//   })
// }

// function getArrayTypeMismatchErrorMessage (entry, type) {
//   return `Data State Array expected entry of type "${(new type()).constructor.name.toLowerCase()}," received "${typeof entry}."`
// }

// function getMapProxy (map) {
//   console.log('PROXY', map)
// }

// function getObjectTypeMismatchErrorMessage (model, property, value) {
//   return `Property "${property}" value (type "${typeof value}") does not match the type "${(new model[property]()).constructor.name.toLowerCase()}" as specified in the model.`
// }

// function getSetProxy (state) {
//   console.log('PROXY', state)
// }

