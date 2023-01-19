import BaseAttributeListBinding from './BaseAttributeListBinding'

export default class AttributeListBinding extends BaseAttributeListBinding {
  async reconcile (init) {
    let { previous, current } = super.reconcile(init)

    if (Array.isArray(previous)) {
      previous = this.#processValue(previous)
    }

    if (Array.isArray(current)) {
      current = this.#processValue(current)
    }

    if (init) {
      this.dummy.classList.add(...(Array.isArray(current) ? current : [current]).filter(Boolean))
      return this.element.setAttribute(this.name, this.dummy.classList.toString())
    }

    if (!current) {
      previous = (Array.isArray(previous) ? previous : [previous]).filter(entry => !this.existing.includes(entry))
      this.dummy.classList.remove(...previous)
      return this.element.setAttribute(this.name, this.dummy.classList.toString())
    }
    
    if (!previous) {
      this.dummy.classList.add(...this.existing, ...(Array.isArray(current) ? current : [current]))
      return this.element.setAttribute(this.name, this.dummy.classList.toString())
    }
    
    (Array.isArray(previous) ? previous : [previous].filter(Boolean)).forEach(entry => !this.existing.includes(entry) && this.dummy.classList.remove(entry))
    ;(Array.isArray(current) ? current : [current].filter(Boolean)).forEach(entry => this.dummy.classList.add(entry))
    thiselement.setAttribute(this.name, this.dummy.classList.toString())
  }

  #processValue (value) {
    return value.reduce((result, entry) => {
      return [...result, ...(typeof entry === 'object' ? this.list.processObject(entry, true) : [entry])]
    }, [])
  }
}