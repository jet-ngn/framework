import DataBinding from './DataBinding'

export default class AttributeListBinding extends DataBinding {
  #list

  constructor (app, view, list, interpolation) {
    super(app, view, interpolation)
    this.#list = list
  }

  async getInitialValue () {
    await super.reconcile()
    return this.value
  }

  async reconcile () {
    await super.reconcile(async value => this.#list.reconcile(value))
  }
}