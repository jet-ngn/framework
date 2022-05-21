import DataBindingInterpolation from '../DataBindingInterpolation'

import {
  AttributeBinding,
  AttributeListBinding,
  AttributeListBooleanBinding,
  ContentBinding,
  PropertyBinding,
  ViewBinding
} from '../DataBinding'

const sets = new Map
// const bindings = {}

export function bind (...targets) {
  let transform = targets.pop()
  return new DataBindingInterpolation(targets, transform)
}

function getArrayProxy (arr) {

}

function getMapProxy (map) {

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

      const { bindings, changes, revocable } = sets.get(target)

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

function getSetProxy (set) {
  
}

function getSetByProxy (proxy) {
  return [...sets.values()].find(({ revocable }) => revocable.proxy === proxy)
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
    const set = getSetByProxy(target)

    if (!set) {
      throw new ReferenceError(`Cannot bind to unregistered DataSet`)
    }

    set.bindings.push(binding)
  })

  return binding
}

export function registerAttributeBinding (parent, node, name, interpolation) {
  return registerBinding(new AttributeBinding(...arguments))
}

export function registerAttributeListBinding (parent, list, interpolation) {
  return registerBinding(new AttributeListBinding(...arguments))
}

export function registerAttributeListBooleanBinding (parent, list, name, interpolation) {
  return registerBinding(new AttributeListBooleanBinding(...arguments))
}

export function registerContentBinding (parent, node, interpolation, retainFormatting, renderTemplate) {
  return registerBinding(new ContentBinding(...arguments))
}

export function registerPropertyBinding (parent, node, name, interpolation) {
  return registerBinding(new PropertyBinding(...arguments))
}

export function registerViewBinding (parent, node, interpolation) {
  return registerBinding(new ViewBinding(...arguments))
}

export function registerDataSet (target) {
  if (typeof target !== 'object') {
    throw new TypeError(`DataSets must be initialized on objects, arrays, maps or sets`)
  }

  const revocable = processTarget(target)
  const set = sets.get(target)

  if (set) {
    return set.revocable.proxy
  }

  sets.set(target, {
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

//     const { bindings, changes } = sets.get(target) ?? {}
//     const output = method.apply(target, args)

//     change.value.new = [...target]
//     changes.push(change)

//     console.log(sets);
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

