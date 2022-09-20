import DataBinding from './DataBinding'

export default class PropertyBinding extends DataBinding {
  #name
  #node

  constructor (parent, node, name, interpolation) {
    super(parent, interpolation)
    this.#name = name
    this.#node = node
  }

  reconcile () {
    super.reconcile(({ current }) => this.#node[this.#name] = current)
  }
}