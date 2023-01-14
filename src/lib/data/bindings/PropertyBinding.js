import DataBinding from './DataBinding'

export default class PropertyBinding extends DataBinding {
  #name
  #element

  constructor (app, view, element, name, interpolation) {
    super(app, view, interpolation)
    this.#name = name
    this.#element = element
  }

  * getReconciliationTasks (init = false) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { previous, current }) {
    yield [`Apply property "${this.#name}"`, ({ next }) => {
      this.#element[this.#name] = current
      next()
    }]
  }
}