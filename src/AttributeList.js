import DataBindingInterpolation from './DataBindingInterpolation'

import {
  registerAttributeListBinding,
  registerBooleanAttributeListBinding
} from './registries/DataStoreRegistry'

export default class AttributeList {
  #node
  #name
  #list
  #parent

  constructor (node, name, list, parent) {
    this.#node = node
    this.#name = name
    this.#list = list
    this.#parent = parent
  }

  get node () {
    return this.#node
  }

  get name () {
    return this.#name
  }

  get value () {
    return this.#processList().join(' ')
  }

  #processList () {
    return this.#list.reduce((result, item) => {
      result.push(...this.#processListItem(item))
      return result
    }, [])
  }

  #processListItem (item) {
    if (item instanceof DataBindingInterpolation) {
      console.log('HANDLE DATA BINDING')
      return ['WIP']
      // const bi = registerAttributeListBinding(this.#node, this.#name, item, this.#parent)
      // return [tracker.value]
    }

    console.log('HANDLE PRIMITIVE')
    return ['WIP']

    // switch (typeOf(item)) {
    //   case 'string':
    //   case 'number': return [`${item}`]
    //   case 'object': return this.#processObject(item)
    //   default: throw new TypeError(`Invalid list() argument type "${typeof item}"`)
    // }
  }

  #processObject (obj) {
    return Object.keys(obj).reduce((result, name) => {
      const value = obj[name]
      
      if (value instanceof DataBindingInterpolation) {
        console.log('HANDLE DATA BINDING')
        // const tracker = registerBooleanAttributeListBinding(this.#node, this.#name, name, value, this.#parent)
        // tracker.value === true && result.push(name)
      } else if (typeof value !== 'boolean') {
        throw new TypeError(`Invalid list entry. Expected "boolean"`)
      } else if (value === true) {
        result.push(name)
      }
  
      return result
    }, [])
  }
}