import DataBindingInterpolation from './DataBindingInterpolation'

export default class DataBinding extends DataBindingInterpolation {
  #view
  #value = null

  constructor (view, { targets, transform }) {
    super(targets, transform)
    this.#view = view
  }

  get view () {
    return this.#view
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





