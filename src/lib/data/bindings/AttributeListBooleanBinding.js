import DataBinding from './DataBinding'

export default class AttributeListBooleanBinding extends DataBinding {
  #element
  #entry
  #name
  #isClass

  constructor (list, entry, interpolation) {
    super(list.app, list.view, interpolation)
    this.#element = list.element
    this.#name = list.name
    this.#entry = entry
  }

  * getReconciliationTasks ({ init = false } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { current }) {
    if (!current) {
      return yield [`Remove conditional attribute "${this.#entry}" from "${this.#name}" list`, ({ next }) => {
        this.#element.setAttribute(this.#name, this.#element.getAttribute(this.#name).replace(this.#entry, '').replace(/\s+/g,' ').trim())
        next()
      }]
    }

    yield [`Add conditional attribute "${this.#entry}" to "${this.#name}" list`, ({ next }) => {
      this.#element.setAttribute(this.#name, `${this.#element.getAttribute(this.#name)} ${this.#entry}`.trim())
      next()
    }]
  }
}