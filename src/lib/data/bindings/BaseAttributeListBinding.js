import DataBinding from './DataBinding'

export default class AttributeListBinding extends DataBinding {
  constructor (list, interpolation) {
    super(list.app, list.view, interpolation)
    this.element = list.element
    this.name = list.name
    this.dummy = list.dummy
    this.list = list
  }

  reconcile (init = false) {
    if (init) {
      this.existing = this.element.getAttribute(this.name).trim().split(' ')
      this.existing.length > 0 && this.dummy.classList.add(...this.existing)
    }

    return super.reconcile(init)
  }
}