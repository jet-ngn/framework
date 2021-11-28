export function createID (type = 'nano') {
  switch (type) {
    case 'nano':
    case 'uuid':
    case 'guid': return NGN.DATA.util.GUID()

    default: return NGN.DATA.util.GUID()
  }
}

export function handleDOMContentLoaded (cb) {
  let handler = function () {
    cb()
    document.removeEventListener('DOMContentLoaded', handler)
  }

  document.addEventListener('DOMContentLoaded', handler)
}

export function elementIsVisible (element, partial = false) {
  let rect = element.getBoundingClientRect()
  let visible = rect.bottom > 0 && rect.right > 0
  return partial ? visible : visible && rect.top > 0 && rect.left > 0
}

export function noop () {
  return function () {}
}

export class CompositionUtils {
  static composeConfigs (defaultConfig, ...additionalConfigs) {
    if (additionalConfigs.length === 0) {
      return defaultConfig
    }
  
    let output = Object.assign({}, defaultConfig)
    
    for (let config of additionalConfigs) {
      output = this.composeConfig(output, config)
    }
  
    return output
  }

  static composeConfig (original, update) {
    for (let key of Object.keys(update)) {
      original[key] = this.composeProperty(key, original[key], update[key])
    }

    return original
  }
  
  static composeProperty (property, original, update) {
    if (!original) {
      return update
    }
  
    if (!update) {
      return original
    }
  
    switch (property) {
      case 'name':
      case 'selector':
      case 'initialState':
      case 'manages':
        return update ?? original
      
      case 'data':
      case 'methods':
      case 'references':
        return Object.assign({}, original ?? {}, update ?? {})
  
      case 'on': return this.composeNestedObjects(original, update)
  
      case 'states': return this.composeStates(original, update)
  
      default: throw new Error(`Invalid config property "${property}"`)
    }
  }
  
  static composeNestedObjects (obj1 = {}, obj2 = {}) {
    let output = {}
  
    for (let key of [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])]) {
      let types = []
  
      const bothHave = [obj1, obj2].every(obj => {
        if (!obj.hasOwnProperty(key)) {
          types.push(null)
          return false 
        }
  
        const type = this.getType(obj[key])
        
        if (!['function', 'object'].includes(type)) {
          throw new TypeError(`Invalid "${key}" configuration: Expected function or object, received "${type}"`)
        }
  
        types.push(type)
        return true
      })
  
      if (!bothHave) {
        output[key] = obj1[key] ?? obj2[key]
        continue
      }
  
      if ([...new Set(types)].length > 1) {
        output[key] = obj2[key]
        continue
      }
  
      if (types[0] === 'function') {
        output[key] = this.wrapHandler(obj1[key], obj2[key])
        continue
      }
      
      output[key] = this.composeNestedObjects(obj1[key], obj2[key])
    }
  
    return output
  }
  
  static composeState (name, original, update) {
    let states = [original, update]
  
    const types = states.map(cfg => {
      const type = this.getType(cfg)
  
      if (!['function', 'object'].includes(type)) {
        throw new TypeError(`Invalid "${name}" state configuration: Expected function or object, received "${type}"`)
      }
  
      return type
    })
  
    if ([...new Set(types)].length > 1) {
      if (types[0] === 'function') {
        return Object.assign({}, update, {
          on: this.wrapHandler(original, update.on)
        })
      }
      
      return Object.assign({}, original, {
        on: this.wrapHandler(original.on, update)
      })
    }
  
    if (types[0] === 'function') {
      return this.wrapHandler(original, update)
    }
  
    return this.composeNestedObjects(original, update)
  }
  
  static composeStates (states1, states2) {
    const states = Object.assign({}, states1)
  
    for (let state of Object.keys(states2)) {
      if (!states.hasOwnProperty(state)) {
        states[state] = states2[state]
        continue
      }
  
      states[state] = this.composeState(state, states1[state], states2[state])
    }
  
    return states
  }
  
  static getType (thing) {
    return NGN.isFn(thing) ? 'function' : typeof thing
  }
  
  static wrapHandler (original, update) {
    return function () {
      update.call(this, ...arguments, original ? original.bind(this) : null)
    }
  }
}
