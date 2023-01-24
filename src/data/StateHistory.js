export default class StateHistory {
  #created = Date.now()
  #proxy
  #history = []

  constructor (proxy) {
    this.#proxy = proxy
  }

  get created () {
    return this.#created
  }

  get json () {
    return this.#history
  }

  add (additionalProperties) {
    this.#history.push({
      timestamp: Date.now() - this.#created,
      value: JSON.parse(JSON.stringify(this.#proxy)),
      ...additionalProperties
    })
  }

  get (index) {
    return this.#history.at(index)
  }

  getBefore (index) {
    return this.#history.slice(0, index)
  }

  getAfter (index) {
    return this.#history.slice(index)
  }
}