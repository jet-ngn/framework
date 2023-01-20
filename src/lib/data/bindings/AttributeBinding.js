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

    const payload = {
      element: this.#element,
      name: this.#name,
      value: current
    }

    if ([undefined, null].some(value => current === value)) {
      this.#element.removeAttribute(this.#name)
      return this.callback && this.callback(payload)
    }

    if (Array.isArray(current)) {
      if (this.#list) {
        this.#list.update(current)
      } else {
        this.#list = new AttributeList(this.app, this.view, this.#element, this.#name, current)
      }

      return this.#list.reconcile(init, this.callback)
    }

    if (typeof current !== 'boolean') {
      this.#element.setAttribute(this.#name, current)
      return this.callback && this.callback(payload)
    }

    current ? this.#element.setAttribute(this.#name, '') : this.#element.removeAttribute(this.#name)
    return this.callback && this.callback(payload)
  }
}