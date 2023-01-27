import AttributeBinding from './bindings/AttributeBinding'
import ContentBinding from './bindings/ContentBinding'
import PropertyBinding from './bindings/PropertyBinding'
import ViewBinding from './bindings/ViewBinding'
import StateArray from './StateArray'
import StateObject from './StateObject'

export const states = new Set

export function getStateByProxy (proxy) {
  return [...states].find(state => state.proxy === proxy)
}

export function registerAttributeBinding ({ app, view, element, name, interpolation }) {
  return registerBinding(new AttributeBinding(...arguments))
}

export function registerContentBinding ({ app, parent, view, element, interpolation, childViews, routers, options }) {
  return registerBinding(new ContentBinding(...arguments), options)
}

export function registerPropertyBinding ({ app, view, node, name, interpolation }) {
  return registerBinding(new PropertyBinding(...arguments))
}

export function registerViewBinding ({ app, view, element, config, childViews, routers }) {
  return registerBinding(new ViewBinding(...arguments))
}

export function registerBinding (binding, options) {
  for (const [proxy] of binding.proxies) {
    const state = getStateByProxy(proxy)

    if (!state) {
      throw new ReferenceError(`Cannot bind to unregistered Data State`)
    }

    state.addBinding(binding, options)
  }

  return binding
}

export function registerState (target, model, meta) {
  const state = makeState(...arguments)
  states.add(state)
  return state.proxy
}

function makeState (target, model, meta) {
  if (Array.isArray(target)) {
    return new StateArray(...arguments)
  }

  if (typeof target === 'object') {
    return new StateObject(...arguments)
  }
  
  throw new TypeError(`Data States do not currently support "${target.constructor.name}" primitives.`)
}

export function removeBindingsByView (view) {
  states.forEach(state => {
    state.removeBindingsByView(view)

    if (state === view.data) {
      console.log('TODO: State is view.data. Remove.')
    }
    // if (state.bindings.length === 0) {
    //   states.delete(key)
    // }
  })
}

export function removeBinding (binding) {
  states.forEach(console.log)
}

export function removeState (state) {
  states.delete(state)
}

export function removeStateByProxy (proxy) {
  states.delete(getStateByProxy(proxy))
}

export function logBindings () {
  console.log('------------')
  console.log([...states].reduce((result, state) => ({
    ...result,
    [state.name]: state
  }), {}));
  console.log([...states].reduce((result, { bindings }) => [...result, ...bindings], []))
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