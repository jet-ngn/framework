import DataBinding from './DataBinding'

export default class PropertyBinding extends DataBinding {
  #name
  #node

  constructor (view, node, name, interpolation) {
    super(view, interpolation)
    this.#name = name
    this.#node = node
  }

  reconcile () {
    super.reconcile(({ current }) => this.#node[this.#name] = current)
  }
}