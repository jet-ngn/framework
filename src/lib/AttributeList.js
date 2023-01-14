export default class AttributeList {
  #list

  constructor (list) {
    this.#list = list
  }

  get value () {
    return this.#processList().join(' ')
  }

  #processList () {
    return this.#list.reduce((result, item) => [...result, ...(this.#processListItem(item))], []).filter(Boolean)
  }

  #processListItem (item) {
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
      
      if (typeof value !== 'boolean') {
        throw new TypeError(`Invalid conditional attribute list entry. Expected "boolean" but received "${typeof value}"`)
      }
      
      value === true && result.push(name)
      return result
    }, [])
  }
}