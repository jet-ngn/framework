import DataBindingInterpolation from './DataBindingInterpolation'

export default class DataBinding extends DataBindingInterpolation {
  #parent
  #value = null

  constructor (parent, { targets, transform }) {
    super(targets, transform)
    this.#parent = parent
  }

  get parent () {
    return this.#parent
  }

  get value () {
    return this.#value
  }

  reconcile (cb) {
    const previous = this.#value
    let newValue = this.transform(...this.targets)
    newValue = Array.isArray(newValue) ? [...newValue] : newValue

    if (newValue !== this.#value) {
      this.#value = newValue

      cb && cb({
        previous,
        current: this.#value
      })
    }
  }
}





