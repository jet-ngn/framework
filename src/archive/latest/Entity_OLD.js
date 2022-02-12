import { typeOf } from 'NGN/libdata'
import Driver from './Entity.js'

class CompositionUtils {
  static composeConfigs (cfg) {
    const extensions = [...(cfg.composes ?? [])]

    if (extensions.length === 0) {
      return cfg
    }

    const configs = [...extensions.map(sup => {
      return sup instanceof Entity ? sup.cfg : this.composeConfigs(sup)
    }), cfg]

    let output = {}

    for (let config of configs) {
      output = this.composeConfig(output, config)
    }
    
    return output
  }

  static composeConfig (cfg, extension) {
    for (let key of Object.keys(extension)) {
      cfg[key] = this.composeProperty(key, cfg[key], extension[key])
    }

    return cfg
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
      case 'initialState': return update ?? original

      case 'data':
      case 'methods':
      case 'references':
        return Object.assign({}, original ?? {}, update ?? {})

      case 'manages': return [...new Set(...original, ...update)]
      case 'composes': return original
      case 'on': return this.composeNestedObjects(original, update)
      case 'states': return this.composeStates(original, update)
    
      default: throw new Error(`Invalid config property "${property}"`)
    }
  }

  static #composeNestedObjects = (obj1 = {}, obj2 = {}) => {
    let output = {}
  
    for (let key of [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])]) {
      let types = []
  
      const bothHave = [obj1, obj2].every(obj => {
        if (!obj.hasOwnProperty(key)) {
          types.push(null)
          return false 
        }
  
        const type = typeof obj[key]
        
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
        output[key] = this.#wrapHandler(obj1[key], obj2[key])
        continue
      }
      
      output[key] = this.#composeNestedObjects(obj1[key], obj2[key])
    }
  
    return output
  }
  
  static composeState (name, original, update) {
    let states = [original, update]
  
    const types = states.map(cfg => {
      const type = typeof cfg

      if (!['function', 'object'].includes(type)) {
        throw new TypeError(`Invalid "${name}" state configuration: Expected function or object, received "${type}"`)
      }
  
      return type
    })
  
    if ([...new Set(types)].length > 1) {
      if (types[0] === 'function') {
        return { ...update, on: this.#wrapHandler(original, update.on) }
      }
      
      return { ...original, on: this.#wrapHandler(original.on, update) }
    }
  
    if (types[0] === 'function') {
      return this.#wrapHandler(original, update)
    }
  
    return this.#composeNestedObjects(original, update)
  }
  
  static composeStates (states1, states2) {
    const states = { ...states1 }
  
    for (let state of Object.keys(states2)) {
      if (!states.hasOwnProperty(state)) {
        states[state] = states2[state]
        continue
      }
  
      states[state] = this.composeState(state, states1[state], states2[state])
    }
  
    return states
  }
  
  static #wrapHandler = (original, update) => {
    return function () {
      update.call(this, ...arguments, original ? original.bind(this) : null)
    }
  }
}

function validateConfig ({ name, manages }) {
  if (!!manages && !Array.isArray(manages)) {
    throw new TypeError(`Entity "${name}" configuration property "manages" expected array, received "${typeOf(manages)}"`)
  }

  return arguments[0]
}

export default class Entity extends Driver() {
  #manages

  constructor (cfg) {
    cfg = CompositionUtils.composeConfigs(cfg)
    
    super(cfg)

    const { manages, selector } = cfg

    if (!!manages && !Array.isArray(manages)) {
      throw new TypeError(`Entity "${this.name}" configuration property "manages" expected array, received "${typeOf(manages)}"`)
    }
    
    this.#manages = manages ?? null
  }

  get manages () {
    return this.#manages
  }

  get selector () {
    return this.#selector 
      ? this.#selector.includes('#')
        ? `${this.#selector}`
        : `${this.manager ? `${this.manager.selector} ` : ''}${this.#selector}`
      : null
  }

  initialize () {
    super.initialize({ selector: this.selector })
  }
}