import DataBinding from './DataBinding'

export default class PropertyBinding extends DataBinding {
  #name
  #element

  constructor ({ app, view, element, name, interpolation }) {
    super(app, view, interpolation)
    this.#name = name
    this.#element = element
  }

  async reconcile (init = false) {
    const { previous, current } = super.reconcile(init)
    this.#element[this.#name] = current
  }
}