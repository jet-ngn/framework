import DataBinding from './DataBinding'

export default class AttributeListBinding extends DataBinding {
  #element
  #name
  #isClass

  constructor (list, interpolation) {
    super(list.app, list.view, interpolation)
    this.#element = list.element
    this.#name = list.name
    this.#isClass = list.name === 'class'
  }

  * getReconciliationTasks ({ init = false } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { previous, current }) {
    if (!current) {
      if (!previous) {
        return
      }

      if (this.#isClass) {
        return yield [`Remove class attribute list entry`, ({ next }) => {
          this.#element.classList.remove(previous)
          next()
        }]
      }

      return yield [`Remove "${this.#name}" attribute list entry`, ({ next }) => {
        this.#element.setAttribute(this.#name, this.#element.getAttribute(this.#name).split(' ').reduce((result, slug) => {
          slug = slug.trim()
          return slug === previous ? result : result += ` ${slug}`
        }, ''))

        next()
      }]
    }

    if (!previous) {
      return yield [`Add entry to "${this.#name}" attribute list`, ({ next }) => {
        this.#element.setAttribute(this.#name, `${this.#element.getAttribute(this.#name)} ${current}`)
        next()
      }]
    }

    yield [`Replace entry in "${this.#name}" attribute list`, ({ next }) => {
      this.#element.setAttribute(this.#name, this.#element.getAttribute(this.#name).replace(previous, current))
    }]
  }
}