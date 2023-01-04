import DataBinding from './DataBinding'

export default class PropertyBinding extends DataBinding {
  #name
  #node

  constructor (app, view, node, name, interpolation) {
    super(app, view, interpolation)
    this.#name = name
    this.#node = node
  }

  async reconcile () {
    await super.reconcile(async ({ current }) => this.#node[this.#name] = current)
  }
}