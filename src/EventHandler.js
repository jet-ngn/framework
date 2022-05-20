export default class EventHandler {
  #id = Symbol()

  #view
  #event
  #callback

  #minCalls
  #maxCalls
  #maxExecutions
  #interval
  // #ttl

  #calls = 0
  #executions = 0

  constructor (view, event, callback, cfg) {
    this.#view = view
    this.#event = event
    this.#callback = callback

    const { min, max, tries, interval/*, ttl*/ } = cfg ?? {}

    this.#minCalls = min ?? 0
    this.#maxCalls = tries ?? Infinity
    this.#maxExecutions = max ?? Infinity
    this.#interval = interval ?? 0
    // this.#ttl = ttl ?? -1
  }

  get id () {
    return this.#id
  }

  async call (evt, ...args) {
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