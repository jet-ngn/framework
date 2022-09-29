import DataBindingInterpolation from './DataBindingInterpolation'
import AttributeBinding from './AttributeBinding'
import AttributeListBinding from './AttributeListBinding'
import AttributeListBooleanBinding from './AttributeListBooleanBinding'
import ContentBinding from './ContentBinding'
import PropertyBinding from './PropertyBinding'
import ViewBinding from './ViewBinding'

export const sets = new Map

export function bind (...targets) {
  let transform = targets.pop()
  return new DataBindingInterpolation(targets, transform)
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

export function registerContentBinding (parent, node, interpolation, retainFormatting) {
  return registerBinding(new ContentBinding(...arguments))
}

export function registerPropertyBinding (parent, node, name, interpolation) {
  return registerBinding(new PropertyBinding(...arguments))
}

export function registerViewBinding (parent, node, interpolation) {
  return registerBinding(new ViewBinding(...arguments))
}

export function registerDataset (target, isGlobal = false) {
  if (typeof target !== 'object') {
    throw new TypeError(`Datasets must be initialized on objects, arrays, maps or sets`)
  }

  return sets.has(target) ? sets.get(target).revocable.proxy : processTarget(target, null, isGlobal)
}

export function removeBindingsByView (view) {
  view.children.forEach(removeBindingsByView)

  for (let [key, { bindings }] of sets) {
    sets.get(key).bindings = bindings.reduce((result, binding) => {
      return binding.parent === view ? result : [...result, binding]
    }, [])
  }
}

export function logBindings () {
  console.log([...sets].reduce((result, [key, { bindings }]) => [...result, ...bindings], []));
}

function getArrayMethodHandler (target, property, reconcile = false) {
  return (...args) => {
    const method = target[property]

    const change = {
      timestamp: Date.now(),
      action: property,

      value: {
        previous: [...target],
        current: null
      }
    }

    const { bindings, changes } = sets.get(target) ?? {}
    const output = method.apply(target, args)

    change.value.current = [...target]
    changes.push(change)
    
    for (let binding of bindings) {
      binding.reconcile(reconcile ? undefined : property)
    }

    return output
  }
}

function getArrayProxy (arr) {
  return Proxy.revocable(arr, {
    get: (target, property) => {
      let reconcile = false

      switch (property) {
        case 'pop':
        case 'push':
        case 'shift':
        case 'unshift': break

        case 'copyWithin':
        case 'fill':
        case 'reverse':
        case 'sort':
        case 'splice': 
          reconcile = true
          break
      
        default: return target[property]
      }

      return getArrayMethodHandler(target, property, reconcile)
    },

    set: () => {
      console.log('SET ARRAY')
      // TODO: Add logic here for setting properties like length:
      // arr.length = 0
      // This can clear the array without having to reassign
    }
  })
}

function getMapProxy (map) {

}

function getObjectProxy (obj) {
  Object.keys(obj).forEach((key) => obj[key] = processTarget(obj[key], obj, false))

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

function getSetProxy (set) {
  
}

function getSetByProxy (proxy) {
  return [...sets.values()].find(({ revocable }) => revocable.proxy === proxy)
}

function processTarget (target, parent, isGlobal = true) {
  let isProxy = true
  let revocable

  if (!target) {
    isProxy = false
  } else if (Array.isArray(target)) {
    revocable = getArrayProxy(target)
  } else if (target instanceof Map) {
    revocable = getMapProxy(target)
  } else if (target instanceof Set) {
    revocable = getSetProxy(target)
  } else if (typeof target === 'object') {
    revocable = getObjectProxy(target)
  } else {
    isProxy = false
  }

  if (isProxy) {
    const set = sets.get(target)

    if (set) {
      return set.revocable.proxy
    }

    sets.set(target, {
      parent,
      revocable,
      bindings: [],
      changes: [],
      isGlobal
    })

    return revocable.proxy
  }

  return target
}

function registerBinding (binding) {
  binding.targets.forEach(target => {
    const set = getSetByProxy(target)

    if (!set) {
      throw new ReferenceError(`Cannot bind to unregistered Dataset`)
    }

    set.bindings.push(binding)
  })

  return binding
}

// function getMapProxy (map) {
//   console.log('PROXY', map)
// }

// function getSetProxy (set) {
//   console.log('PROXY', set)
// }`

