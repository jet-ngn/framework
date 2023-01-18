import DataBinding from './DataBinding'

export default class AttributeListBooleanBinding extends DataBinding {
  #element
  #entry
  #name
  #dummy

  constructor (list, entry, interpolation) {
    super(list.app, list.view, interpolation)
    this.#element = list.element
    this.#name = list.name
    this.#entry = entry
    this.#dummy = list.dummy
  }

  * getReconciliationTasks ({ init = false } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { current }) {
    if (init) {
      this.#dummy.classList.add(...((this.#element.getAttribute(this.#name) ?? '').split(' ').filter(Boolean)))
    }

    if (!current) {
      return yield [`Remove conditional attribute "${this.#entry}" from "${this.#name}" list`, ({ next }) => {
        this.#dummy.classList.remove(this.#entry)
        this.#element.setAttribute(this.#name, this.#dummy.classList.toString())
        next()
      }]
    }

    yield [`Add conditional attribute "${this.#entry}" to "${this.#name}" list`, ({ next }) => {
      this.#dummy.classList.add(this.#entry)
      this.#element.setAttribute(this.#name, this.#dummy.classList.toString())
      next()
    }]
  }
}