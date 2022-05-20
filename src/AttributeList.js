// import DataBindingInterpolation from './DataBindingInterpolation'

export default class AttributeList {
  #node
  #name
  #list
  #parent

  constructor (parent, node, name, list) {
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
    return this.#list.reduce((result, item) => [...result, ...this.#processListItem(item)], [])
  }

  #processListItem (item) {
    // if (item instanceof DataBindingInterpolation) {
    //   const binding = registerAttributeListBinding(this.#parent, this.#node, this.#name, this.#list, item)
    //   return [...binding.reconcile()]
    // }

    switch (typeof item) {
      case 'string':
      case 'number': return [`${item}`]
      case 'object': return this.#processObject(item)
      default: throw new TypeError(`Invalid list() argument type "${typeof item}"`)
    }
  }

  #processObject (obj) {
    return Object.keys(obj).reduce((result, name) => {
      const value = obj[name]
      
      // if (value instanceof DataBindingInterpolation) {
      //   const binding = registerBinding(this.#node, this.#name, name, value, this.#parent)
      //   console.log(binding)
      //   // tracker.value === true && result.push(name)
      // } else 
      
      if (typeof value !== 'boolean') {
        throw new TypeError(`Invalid conditional attribute list entry. Expected "boolean" but received "${typeof value}"`)
      } else if (value === true) {
        result.push(name)
      }
  
      return result
    }, [])
  }
}