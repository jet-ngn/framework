import DataBinding from './DataBinding'

export default class AttributeListBinding extends DataBinding {
  #attribute
  #element
  #name
  #isClass
  #dummy

  constructor (list, interpolation) {
    super(list.app, list.view, interpolation)
    this.#element = list.element
    this.#name = list.name
    this.#isClass = list.name === 'class'
    this.#dummy = list.dummy
  }

  * getReconciliationTasks ({ init = false, method = null } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this, method))
  }

  * #getReconciliationTasks (method, init, { previous, current }) {
    if (init) {
      return yield [`Initialize "${this.#name}" attribute list`, ({ next }) => {
        const existing = this.#element.getAttribute(this.#name).trim()
        this.#dummy.classList.add(...existing.split(' '), ...(Array.isArray(current) ? current : [current]).filter(Boolean))
        this.#element.setAttribute(this.#name, this.#dummy.classList.toString())
        console.log(this.#dummy)
        next()
      }]
    }

    if (!current) {
      return yield [`Remove "${this.#attribute}" attribute list entry`, ({ next }) => {
        this.#dummy.classList.remove(...(Array.isArray(previous) ? previous : [previous]))
        this.#element.setAttribute(this.#name, this.#dummy.classList.toString())
        next()
      }]
    }
    
    if (!previous) {
      return yield [`Add "${this.#name}" attribute list entry`, ({ next }) => {
        this.#dummy.classList.add(...(Array.isArray(current) ? current : [current]))
        this.#element.setAttribute(this.#name, this.#dummy.classList.toString())
        next()
      }]
    }
    
    yield [`Replace entry in "${this.#name}" attribute list`, ({ next }) => {
      (Array.isArray(previous) ? previous : [previous].filter(Boolean)).forEach(entry => this.#dummy.classList.remove(entry))
      ;(Array.isArray(current) ? current : [current].filter(Boolean)).forEach(entry => this.#dummy.classList.add(entry))
      this.#element.setAttribute(this.#name, this.#dummy.classList.toString())
      next()
    }]
  }
}