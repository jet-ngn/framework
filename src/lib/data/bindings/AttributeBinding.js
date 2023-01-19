import DataBinding from './DataBinding'
import AttributeList from '../../AttributeList'

export default class AttributeBinding extends DataBinding {
  #name
  #element
  #list

  constructor ({ app, view, element, name, value }) {
    super(app, view, value)
    this.#name = name
    this.#element = element
  }

  async reconcile (init = false) {
    const { current } = super.reconcile(init)

    if ([undefined, null].some(value => current === value)) {
      return this.#element.removeAttribute(this.#name)
    }

    if (Array.isArray(current)) {
      if (this.#list) {
        this.#list.update(current)
      } else {
        this.#list = new AttributeList(this.app, this.view, this.#element, this.#name, current)
      }

      return this.#list.reconcile(init)
    }

    if (typeof current !== 'boolean') {
      return this.#element.setAttribute(this.#name, current)
    }

    current ? this.#element.setAttribute(this.#name, '') : this.#element.removeAttribute(this.#name)
  }
}