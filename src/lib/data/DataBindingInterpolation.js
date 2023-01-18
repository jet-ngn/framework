import IdentifiedClass from '../IdentifiedClass'

export default class DataBindingInterpolation extends IdentifiedClass {
  #proxies
  #transform

  constructor ({ proxies, transform }) {
    super('data-binding')
    this.#proxies = proxies
    this.#transform = transform
  }

  get proxies () {
    return this.#proxies
  }

  get transform () {
    return this.#transform
  }
}