import DataBinding from './DataBinding'

export default class AttributeListBooleanBinding extends DataBinding {
  #list
  #name

  constructor (parent, list, name, interpolation) {
    super(parent, interpolation)
    this.#list = list
    this.#name = name
  }

  get initialValue () {
    super.reconcile()
    return this.value
  }

  reconcile () {
    super.reconcile(({ current }) => this.#list[current === true ? 'add' : 'remove'](this.#name))
  }
}