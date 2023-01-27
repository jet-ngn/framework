import BaseAttributeListBinding from './BaseAttributeListBinding'

export default class AttributeListBooleanBinding extends BaseAttributeListBinding {
  #entry

  constructor (list, entry, interpolation) {
    super(list, interpolation)
    this.#entry = entry
  }

  async reconcile (init = false) {
    let { current } = super.reconcile(init)

    if (!current) {
      !this.existing.includes(current) && this.dummy.classList.remove(this.#entry)
      return this.element.setAttribute(this.name, this.dummy.classList.toString())
    }

    this.dummy.classList.add(this.#entry)
    this.element.setAttribute(this.name, this.dummy.classList.toString())
  }
}