export default class StateHistory {
  #proxy
  #history = new Set

  constructor (proxy) {
    this.#proxy = proxy
    this.add()
  }

  get json () {
    return [...this.#history]
  }

  add (additionalProperties) {
    this.#history.add({
      timestamp: Date.now(),
      value: { ...this.#proxy },
      ...additionalProperties
    })
  }

  get (index) {
    return [...this.#history].at(index)
  }

  getBefore (index) {
    return [...this.#history].slice(0, index)
  }

  getAfter (index) {
    return [...this.#history].slice(index)
  }

  undo (levels = 1) {
    console.log('UNDO', levels)
  }
}