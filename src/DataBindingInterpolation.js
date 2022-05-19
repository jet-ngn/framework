import IdentifiedClass from './IdentifiedClass'

export default class DataBindingInterpolation extends IdentifiedClass {
  #targets
  #transform

  constructor (targets, transform) {
    super('data-binding')
    this.#targets = targets
    this.#transform = transform
  }

  get targets () {
    return this.#targets
  }

  get transform () {
    return this.#transform
  }
}