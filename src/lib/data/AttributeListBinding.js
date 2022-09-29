import DataBinding from './DataBinding'

export default class AttributeListBinding extends DataBinding {
  #list

  constructor (view, list, interpolation) {
    super(view, interpolation)
    this.#list = list
  }

  get initialValue () {
    super.reconcile()
    return this.value
  }

  reconcile () {
    super.reconcile(value => this.#list.reconcile(value))
  }
}