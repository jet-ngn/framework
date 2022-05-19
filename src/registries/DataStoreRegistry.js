import DataBindingInterpolation from '../DataBindingInterpolation'
import { ContentBinding } from '../DataBinding'

const stores = new Map
// const bindings = {}

export function bind (...targets) {
  let transform = targets.pop()
  return new DataBindingInterpolation(targets, transform)
}

function getObjectProxy (obj) {
  Object.keys(obj).forEach(key => obj[key] = processTarget(obj[key]))

  return Proxy.revocable(obj, {
    get: (target, property) => target[property],

    set: (target, property, value) => {
      const currentValue = target[property]

      if (currentValue === value) {
        return true
      }

      const { bindings, changes, revocable } = stores.get(target)

      changes.push({
        timestamp: Date.now(),
        property,
        value: {
          previous: currentValue,
          current: value
        }
      })

      target[property] = processTarget(value)

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

function getStoreByProxy (proxy) {
  return [...stores.values()].find(({ revocable }) => revocable.proxy === proxy)
}

function processTarget (target) {
  if (Array.isArray(target)) {
    return getArrayProxy(target)
  }
  
  if (target instanceof Map) {
    return getMapProxy(target)
  }

  if (target instanceof Set) {
    return getSetProxy(target)
  }
  
  if (typeof target === 'object') {
    return getObjectProxy(target)
  }

  return target
}

function registerBinding (binding) {
  binding.targets.forEach(target => {
    const store = getStoreByProxy(target)

    if (!store) {
      throw new ReferenceError(`Cannot bind to unregistered DataStore`)
    }

    store.bindings.push(binding)
  })

  return binding
}

export function registerContentBinding (parent, node, interpolation) {
  return registerBinding(new ContentBinding(...arguments))
}

export function registerAttributeListBinding () {
  
}
  
export function registerBooleanAttributeListBinding () {

}

export function registerDataStore (target) {
  if (typeof target !== 'object') {
    throw new TypeError(`DataStores must be initialized on objects, arrays, maps or sets`)
  }

  const revocable = processTarget(target)
  const store = stores.get(target)

  if (store) {
    return store.revocable.proxy
  }

  stores.set(target, {
    revocable,
    bindings: [],
    changes: []
  })

  return revocable.proxy
}

// function getArrayMethodHandler (target, property, reconcile = false) {
//   return (...args) => {
//     const method = target[property]

//     const change = {
//       timestamp: Date.now(),
//       action: property,

//       value: {
//         previous: [...target],
//         current: null
//       }
//     }

//     const { bindings, changes } = stores.get(target) ?? {}
//     const output = method.apply(target, args)

//     change.value.new = [...target]
//     changes.push(change)

//     console.log(stores);
//     // for (let tracker of trackers) {
//     //   if (tracker instanceof ArrayContentTracker && !reconcile) {
//     //     tracker[property](...args)
//     //   } else {
//     //     tracker.reconcile()
//     //   }
//     // }

//     return output
//   }
// }

// function getArrayProxy (arr) {
//   return Proxy.revocable(arr, {
//     get: (target, property) => {
//       switch (property) {
//         case 'pop':
//         case 'push':
//         case 'shift':
//         case 'unshift': return getArrayMethodHandler(target, property)

//         case 'copyWithin':
//         case 'fill':
//         case 'reverse':
//         case 'sort':
//         case 'splice': return getArrayMethodHandler(target, property, true)
      
//         default: return target[property]
//       }
//     },

//     set: () => {
//       console.log('SET ARRAY')
//       // TODO: Add logic here for setting properties like length:
//       // arr.length = 0
//       // This can clear the array without having to reassign
//     }
//   })
// }

// function getMapProxy (map) {
//   console.log('PROXY', map)
// }

// function getSetProxy (set) {
//   console.log('PROXY', set)
// }`

