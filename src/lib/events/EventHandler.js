export default class EventHandler {
  #callback
  #view
  #minCalls
  #maxCalls
  #maxExecutions
  #interval
  #calls = 0
  #executions = 0

  constructor (view, callback, { min = 0, max = Infinity, tries = Infinity, interval = 0 } = {}) {
    this.#view = view
    this.#callback = callback
    this.#minCalls = min
    this.#maxCalls = tries
    this.#maxExecutions = max
    this.#interval = interval
  }

  async call () {
    this.#calls++

    if (this.#calls < this.#minCalls || this.#calls > this.#maxCalls) {
      return false
    }

    if (!!(this.#calls % this.#interval)) {
      return true
    }

    if (this.#executions < this.#maxExecutions) {
      return await this.#execute(...arguments)
    }

    return false
  }

  async #execute (evt, ...args) {
    this.#executions++

    this.#view.event = {
      name: evt,
      calls: this.#calls,
      executions: this.#executions
    }

    await this.#callback.apply(this.#view, args)
    delete this.#view.event

    return true
  }
}