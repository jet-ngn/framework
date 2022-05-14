import IdentifiableClass from './IdentifiableClass'

export default class TrackingInterpolation extends IdentifiableClass {
  #target
  #property
  #transform

  constructor (target, property, transform) {
    super('tracker')
    this.#target = target
    this.#property = property
    this.#transform = transform ?? (value => value)

    if (typeof property === 'function') {
      this.#property = null
      this.#transform = property
    }
  }

  get target () {
    return this.#target
  }

  get property () {
    return this.#property
  }

  get transform () {
    return this.#transform
  }
}