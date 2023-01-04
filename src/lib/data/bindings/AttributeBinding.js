import DataBinding from './DataBinding'

export default class AttributeBinding extends DataBinding {
  #name
  #node

  constructor (app, view, node, name, interpolation) {
    super(app, view, interpolation)
    this.#name = name
    this.#node = node
  }

  async reconcile () {
    await super.reconcile(async ({ current }) => {
      if (Array.isArray(current)) {
        const list = new AttributeList(this.view, this.#node, this.#name, current)
        current = await list.getValue()
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