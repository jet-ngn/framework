import NGN from 'NGN'

export default class EventHandler {
  #event
  #callback
  #id

  #minCalls
  #maxCalls
  #interval
  #intervalStart
  #calls = 0
  #executions = 0

  // #maxExecutions
  // #before // Do something every execution before the nth call
  // #after // Do something every execution after the nth call
  // Make these configurable with their own min, max, intervals etc
  // Or, make these methods on the bus. These would be their own classes in this case.

  constructor (event, callback, cfg, id = 'EventHandler') {
    this.#event = event
    this.#callback = callback
    this.#id = Symbol(id)

    this.#minCalls = cfg?.min ?? 0
    this.#maxCalls = cfg?.max ?? Infinity
    this.#interval = cfg?.interval ?? 0
    this.#intervalStart = cfg?.intervalStart ?? 0
  }

  get callback () {
    return this.#callback
  }

  get calls () {
    return this.#calls
  }

  get executions () {
    return this.#executions
  }

  get id () {
    return this.#id
  }

  call () {
    this.#calls++

    if ((this.#minCalls > 0 && this.#calls < this.#minCalls) || (this.#interval > 0 && this.#calls % this.#interval !== 0)) {
      return console.log('SKIP ME')
    }

    this.#execute(...arguments)
  }

  reset () {
    this.#calls = 0
    this.#executions = 0
  }

  #execute = (...args) => {
    console.log(this);
    this.#callback(...args)
    this.#executions++

    if (this.#maxCalls < Infinity && this.#calls === this.#maxCalls) {
      NGN.INTERNAL(`${this.constructor.name}.remove`, this)
    }
  }
}