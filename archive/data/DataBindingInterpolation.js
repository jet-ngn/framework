import IdentifiedClass from '../lib/IdentifiedClass'

export default class DataBindingInterpolation extends IdentifiedClass {
  #proxies
  #transform
  #callback

  constructor ({ proxies, transform }) {
    super('data-binding')
    this.#proxies = proxies
    this.#transform = transform
  }

  get callback () {
    return this.#callback
  }

  get proxies () {
    return this.#proxies
  }

  get transform () {
    return this.#transform
  }

  then (callback) {
    this.#callback = callback
    return this
  }
}