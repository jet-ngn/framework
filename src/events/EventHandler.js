// This class adds functionality to the NGN Event Handler.
// Some of it should be considered for integration into NGN.
export default class EventHandler {
  #id = Symbol()
  
  #event
  #callback

  #minCalls
  #maxCalls
  #maxExecutions
  #interval
  #ttl

  #calls = 0
  #executions = 0

  constructor (event, { min, max, tries, interval, ttl }, callback) {
    this.#event = event
    this.#callback = callback

    this.#minCalls = min ?? 0
    this.#maxCalls = tries ?? Infinity
    this.#maxExecutions = max ?? Infinity
    this.#interval = interval ?? 0
    // this.#ttl = ttl ?? -1
  }

  get interval () {
    return this.#interval
  }

  get minCalls () {
    return this.#minCalls
  }

  get maxCalls () {
    return this.#maxCalls
  }

  get maxExecutions () {
    return this.#maxExecutions
  }

  // get ttl () {
  //   return this.#ttl
  // }

  async call (context, eventName, ...args) {
    this.#calls++

    if (this.#calls < this.#minCalls) {
      return false
    }

    if (this.#calls > this.#maxCalls) {
      return false
    }

    if (!!(this.#calls % this.#interval)) {
      return true
    }

    return await this.#execute(...arguments)
  }

  async #execute (context, evt, ...args) {
    this.#executions++

    if (this.#executions > this.#maxExecutions) {
      return false
    }

    context.event = {
      name: getNamespacedEvent(context.name, this.#event),
      calls: this.#calls,
      executions: this.#executions
    }

    if (this.#event.includes('*')) {
      context.event.origin = evt
    }

    await this.#callback.call(context, ...args)
    delete context.event

    return true
  }
}