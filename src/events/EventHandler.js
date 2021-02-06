import { createId } from '../Utilities.js'

export default class EventHandler {
  #context
  #id = createId()
  #min
  #max
  #interval
  #intervalStart
  #callback
  #calls = 0
  #executions = 0
  #event

  constructor (context, evt, { max = Infinity, min = 0, interval = 0, intervalStart = 0 }, callback) {
    this.#event = evt
    this.#callback = callback

    this.#context = context
    this.#max = max
    this.#min = min
    this.#interval = interval
    this.#intervalStart = intervalStart
  }

  get callback () {
    return this.#callback
  }

  get calls () {
    return this.#calls
  }

  get event () {
    return this.#event
  }

  get executions () {
    return this.#executions
  }

  get id () {
    return this.#id
  }

  get interval () {
    return this.#interval
  }

  get intervalStart () {
    return this.#intervalStart
  }

  get maxExecutions () {
    return this.#max
  }

  get minCalls () {
    return this.#min
  }

  call (context, name, source, ...rest) {
    if (this.#max < Infinity && this.#calls === this.#max) {
      return { action:'delete' }
    }

    this.#calls++

    if (this.#min > 0 && this.#calls < this.#min) {
      return { action: 'skip' }
    }

    if (this.#interval > 0 && this.#calls % this.#interval !== 0) {
      return { action: 'skip' }
    }

    return this.execute(...arguments)
  }

  execute (context, name, source, ...rest) {
    const evt = {
      name: this.#event,
      calls: this.#calls
    }

    if (this.#event.includes('*')) {
      evt.referredEvent = name
    }

    if (source && source !== this.#context) {
      evt.source = source
    }

    this.#executions++
    this.#callback.call(this.#context, { ...evt, executions: this.#executions }, ...rest)

    return { action: 'execute' }
  }
}
