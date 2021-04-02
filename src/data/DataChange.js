export default class DataChange {
  #property
  #change
  #aborted = false

  constructor (property, change) {
    this.#property = property
    this.#change = change
  }

  get aborted () {
    return this.#aborted === true
  }

  get current () {
    return this.#change.current
  }

  get update () {
    return this.#change.update
  }

  abort () {
    this.#aborted = true
  }
}
