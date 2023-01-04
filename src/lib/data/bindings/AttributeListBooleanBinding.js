import DataBinding from './DataBinding'

export default class AttributeListBooleanBinding extends DataBinding {
  #list
  #name

  constructor (app, view, list, name, interpolation) {
    super(app, view, interpolation)
    this.#list = list
    this.#name = name
  }

  async getInitialValue () {
    await super.reconcile()
    return this.value
  }

  async reconcile () {
    await super.reconcile(async ({ current }) => this.#list[current === true ? 'add' : 'remove'](this.#name))
  }
}