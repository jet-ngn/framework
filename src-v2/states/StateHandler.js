export default class StateHandler {
  #type
  #handler
  #executions = 0
  #runsOnceOnly = false

  constructor (type, handler) {
    this.#type = type
    this.#handler = handler

    if (type.includes('once')) {
      this.#runsOnceOnly = true
    }
  }

  get executions () {
    return this.#executions
  }

  get runsOnceOnly () {
    return this.#runsOnceOnly
  }

  get type () {
    return this.#type
  }

  execute (context, ...rest) {
    this.#executions++
    return this.#handler.call(context, ...rest)
  }
}
