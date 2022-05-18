import DataBindingInterpolation from '../DataBindingInterpolation'
import { ContentBinding } from '../DataBinding'

export function bind (targets, properties, transform) {
  return new DataBindingInterpolation({ targets, properties, transform })
}

function processValue (value) {
  if (Array.isArray(value)) {
    return proxyArray(value)
  }

  if (value instanceof Map) {
    return proxyMap(value)
  }

  if (value instanceof Set) {
    return proxySet(value)
  }

  if (typeof value === 'object') {
    return proxyObject(value)
  }

  return value
}

function proxyArray (arr) {
  console.log('PROXY', arr)
}

function proxyMap (map) {
  console.log('PROXY', map)
}

function proxyObject (obj) {
  return Proxy.revocable(obj, {
    get: (target, property) => target[property],

    set: (target, property, value) => {
      const currentValue = target[property]

      if (currentValue === value) {
        return true
      }

      const { bindings, changes } = stores.get(target)

      changes.push({
        timestamp: Date.now(),
        property,
        value: {
          previous: currentValue,
          current: value
        }
      })

      target[property] = processValue(value)

      const { revocable } = stores.get(target)

      for (let binding of bindings) {
        const { targets, properties } = binding

        if (targets.includes(revocable.proxy) && (properties.length === 0 || properties.includes(property))) {
          binding.render()
        }
      }

      return true
    }
  })
}

function proxySet (set) {
  console.log('PROXY', set)
}

const stores = new Map
const bindings = {}

function getStoreByProxy (proxy) {
  return [...stores.values()].find(({ revocable }) => revocable.proxy === proxy)
}

export function registerContentBinding (parent, placeholder, interpolation) {
  const binding = new ContentBinding(...arguments)
  bindings[interpolation.id] = binding

  interpolation.targets.forEach(target => {
    const store = getStoreByProxy(target)

    if (!store) {
      throw new Error(`Cannot bind to an unregistered DataStore`)
    }

    store.bindings.push(binding)
  })

  return binding
}

export function registerDataStore (target) {
  if (Object.getPrototypeOf(target) !== Object.prototype) {
    throw new TypeError(`DataStores can only be initialized on plain objects`)
  }

  const store = stores.get(target)

  if (store) {
    return store
  }

  const revocable = proxyObject(target)

  stores.set(target, {
    revocable,
    bindings: [],
    changes: []
  })
  
  return revocable.proxy
}