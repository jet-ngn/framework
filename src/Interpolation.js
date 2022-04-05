import { NANOID } from '@ngnjs/libdata'
import { sanitizeString } from './utilities/StringUtils.js'

class Interpolation {
  #id = NANOID()
  #interpolation

  constructor (interpolation) {
    this.#interpolation = interpolation
  }

  get id () {
    return this.#id
  }

  get interpolation () {
    return this.#interpolation
  }
}

export class TrackingInterpolation {
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