import DataBindingTaskGenerator from './DataBindingTaskGenerator'
import AttributeList from '../../AttributeList'

export default class AttributeBinding extends DataBindingTaskGenerator {
  #name
  #element

  constructor (app, view, element, name, interpolation) {
    super(app, view, interpolation)
    this.#name = name
    this.#element = element
  }

  * getReconciliationTasks ({ init = false } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { previous, current }) {
    if ([undefined, null].some(value => current === value)) {
      return yield [`Remove attribute`, ({ next }) => {
        this.#element.removeAttribute(this.#name)
        next()
      }]
    }

    if (Array.isArray(current)) {
      const list = new AttributeList(this.app, this.view, this.#element, this.#name, current)

      return yield [`Set list attribute`, ({ next }) => {
        this.#element.setAttribute(this.#name, list.value)
        next()
      }]
    }

    if (typeof current !== 'boolean') {
      return yield [`Set non-boolean attribute`, ({ next }) => {
        this.#element.setAttribute(this.#name, current)
        next()
      }]
    }

    yield [`Set boolean attribute`, ({ next }) => {
      current ? this.#element.setAttribute(this.#name, '')  : this.#element.removeAttribute(this.#name)
      next()
    }]
  }
}