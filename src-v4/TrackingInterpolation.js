import { NANOID } from '@ngnjs/libdata'

export default class TrackingInterpolation {
  #id = `tracking-interpolation_${NANOID()}`
  #target
  #property
  #transform

  constructor (target, property, transform) {
    this.#target = target
    this.#property = property
    this.#transform = transform ?? (value => value)

    if (typeof property === 'function') {
      this.#property = null
      this.#transform = property
    }
  }

  get id () {
    return this.#id
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