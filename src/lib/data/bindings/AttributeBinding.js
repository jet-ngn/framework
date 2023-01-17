import DataBinding from './DataBinding'
import AttributeList from '../../AttributeList'

export default class AttributeBinding extends DataBinding {
  #name
  #element
  #list

  constructor (app, view, element, name, interpolation) {
    super(app, view, interpolation)
    this.#name = name
    this.#element = element
  }

  * getReconciliationTasks ({ init = false } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { current }) {
    if ([undefined, null].some(value => current === value)) {
      return yield [`Remove "${this.#name}" attribute`, ({ next }) => {
        this.#element.removeAttribute(this.#name)
        next()
      }]
    }

    if (Array.isArray(current)) {
      if (!this.#list) {
        this.#list = new AttributeList(this.app, this.view, this.#element, this.#name, current)
      }

      this.#list.update(current)
      return yield * this.#list.getReconciliationTasks({ init: true })
    }

    if (typeof current !== 'boolean') {
      return yield [`Set non-boolean "${this.#name}" attribute`, ({ next }) => {
        this.#element.setAttribute(this.#name, current)
        next()
      }]
    }

    yield [`Set boolean "${this.#name}" attribute`, ({ next }) => {
      current ? this.#element.setAttribute(this.#name, '')  : this.#element.removeAttribute(this.#name)
      next()
    }]
  }
}