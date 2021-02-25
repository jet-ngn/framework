export default class PropertyChange {
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

  get next () {
    return this.#change.next
  }

  abort () {
    this.#aborted = true
  }
}
