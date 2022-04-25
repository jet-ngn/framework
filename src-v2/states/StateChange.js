export default class StateChange {
  #change
  #aborted = false

  constructor (change) {
    this.#change = change
  }

  get aborted () {
    return this.#aborted === true
  }

  get current () {
    return this.#change.current ?? null
  }

  get next () {
    return this.#change.next ?? null
  }

  get previous () {
    return this.#change.previous ?? null
  }

  abort () {
    this.#aborted = true
  }
}
