export default class TrackerInterpolation {
  #target
  #property
  #transformFn

  constructor (target, property, transformFn) {
    this.#target = target
    this.#property = property ?? null
    this.#transformFn = transformFn ?? null
  }

  get property () {
    return this.#property
  }

  get target () {
    return this.#target
  }

  get transformFn () {
    return this.#transformFn
  }
}