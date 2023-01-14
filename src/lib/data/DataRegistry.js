import DataBindingInterpolation from './DataBindingInterpolation'
import AttributeBinding from './bindings/AttributeBinding'
import ArrayContentBinding from './bindings/ArrayContentBinding'
import ContentBinding from './bindings/ContentBinding'
import PropertyBinding from './bindings/PropertyBinding'
import ViewBinding from './bindings/ViewBinding'
import StateArray from './states/StateArray'
import StateObject from './states/StateObject'
import DataBinding from './bindings/DataBinding'

export const states = new Map

export function append (proxy, data) {
  console.log('TODO: Add append feature')
  // const state = getStateByProxy(proxy)
  // state.append(data)
}

export function bind (...args) {
  let properties = args[1]
  let transform = args[2] ?? null

  if (typeof properties === 'function') {
    transform = properties
    properties = []
  }

  return new DataBindingInterpolation({
    proxies: new Map([[args[0], Array.isArray(properties) ? properties : [properties]]]),
    transform: transform ?? (data => data)
  })
}

export function bindAll (...args) {
  const config = {
    proxies: new Map,
    transform: args.pop()
  }

  for (const [proxy, ...props] of args) {
    config.proxies.set(proxy, props)
  }

  return new DataBindingInterpolation(config)
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

export function * getAttributeBindingRegistrationTasks (app, view, element, name, interpolation) {
  yield * registerBinding(new AttributeBinding(...arguments)).getReconciliationTasks(true)
}

export function * getContentBindingRegistrationTasks (app, view, element, interpolation, childViews, routers, { retainFormatting }) {
  const args = arguments
  const binding = new DataBinding(app, view, interpolation)

  yield * binding.getReconciliationTasks(true, function * (init, { current }) {
    if (Array.isArray(current)) {
      return yield * registerBinding(new ArrayContentBinding(...args)).getReconciliationTasks({ init })
    }

    yield * registerBinding(new ContentBinding(...args)).getReconciliationTasks(true)
  })
}

export function * getPropertyBindingRegistrationTasks (app, view, node, name, interpolation) {
  yield * registerBinding(new PropertyBinding(...arguments)).getReconciliationTasks(true)
}

export function registerViewBinding (app, view, config, element, childViews, routers) {
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

export function removeBindingsByView (view) {
  for (let [key, state] of states) {
    state.removeBindingsByView(view)

    if (state === view.data) {
      console.log('TODO: State is view.data. Remove.')
    }
    // if (state.bindings.length === 0) {
    //   states.delete(key)
    // }
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
  for (const [proxy, properties] of binding.proxies) {
    const state = getStateByProxy(proxy)

    if (!state) {
      throw new ReferenceError(`Cannot bind to unregistered Data State`)
    }

    state.addBinding(binding)
  }

  return binding
}

export function logBindings () {
  console.log(states);
  console.log([...states].reduce((result, [key, { bindings }]) => [...result, ...bindings], []))
}

// export function removeBindings () {
//   for (let [key, state] of states) {
//     state.clearBindings()
//     const { proxy } = state

//     if (proxy instanceof ViewPermissions) {
//       state.removeChildProxies()
//       states.delete(key)
//     }
//   }
// }