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

  undo (levels = 1) {
    console.log('UNDO', levels)
  }
}