import DataBinding from './DataBinding'

export default class AttributeBinding extends DataBinding {
  #name
  #node

  constructor (parent, node, name, interpolation) {
    super(parent, interpolation)
    this.#name = name
    this.#node = node
  }

  reconcile () {
    super.reconcile(({ current }) => {
      if (Array.isArray(current)) {
        const list = new AttributeList(this.parent, this.#node, this.#name, current)
        current = list.value
      }
      
      if (typeof current !== 'boolean') {
        return this.#node.setAttribute(this.#name, current)
      }
  
      if (!current) {
        return this.#node.removeAttribute(this.#name)
      }
  
      this.#node.setAttribute(this.#name, '')
    })
  }
}