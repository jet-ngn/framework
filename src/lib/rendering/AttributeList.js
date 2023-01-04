import DataBindingInterpolation from '../data/DataBindingInterpolation'
import { registerAttributeListBinding, registerAttributeListBooleanBinding } from '../data/DataRegistry'

export default class AttributeList {
  #app
  #list
  #name
  #node
  #parent

  constructor (app, parent, node, name, list) {
    this.#app = app
    this.#node = node
    this.#name = name
    this.#list = list
    this.#parent = parent
  }

  get name () {
    return this.#name
  }

  get node () {
    return this.#node
  }

  get slugs () {
    return this.#node.getAttribute(this.#name).split(' ')
  }

  async getValue () {
    return (await this.#processList()).join(' ')
  }

  add (name) {
    if (this.#name === 'class') {
      return this.#node.classList.add(name)
    }

    const { slugs } = this
    slugs.push(name)
    this.#node.setAttribute(this.#name, slugs.join(' '))
  }

  reconcile ({ previous, current }) {
    if (this.#name === 'class') {
      return previous
        ? current
          ? this.#node.classList.replace(previous, current)
          : this.#node.classList.remove(previous)
        : this.#node.classList.add(current)
    }

    this.#node.setAttribute(this.#name, this.#node.getAttribute.replace(previous, current))
  }

  remove (name) {
    if (this.#name === 'class') {
      return this.#node.classList.remove(name)
    }
      
    const { slugs } = this
    slugs.splice(slugs.indexOf(name), 1)
    slugs.length === 0 ? this.#node.removeAttribute(this.#name) : this.#node.setAttribute(this.#name, slugs.join(' '))
  }

  async #processList () {
    const result = []

    for (const item of this.#list) {
      result.push(await this.#processListItem(item))
    }

    return result.filter(Boolean)

    // return this.#list.reduce((result, item) => [...result, ...(await this.#processListItem(item))], []).filter(Boolean)
  }

  async #processListItem (item) {
    if (item instanceof DataBindingInterpolation) {
      const binding = registerAttributeListBinding(this.#app, this.#parent, this, item)
      return [await binding.getInitialValue()]
    }

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
      
      if (value instanceof DataBindingInterpolation) {
        const binding = registerAttributeListBooleanBinding(this.#app, this.#parent, this, name, value)
        binding.initialValue === true && result.push(name)
      } else if (typeof value !== 'boolean') {
        throw new TypeError(`Invalid conditional attribute list entry. Expected "boolean" but received "${typeof value}"`)
      } else if (value === true) {
        result.push(name)
      }
  
      return result
    }, [])
  }
}