import Route from '../routes/Route.js'
import StateHandler from './StateHandler.js'

export default class State {
  #name
  #route
  #transitions = null

  #before = null
  #onceBefore = null
  #on = null
  #once = null
  #after = null
  #onceAfter = null
  #off = null

  constructor (name, cfg) {
    this.#name = name
    this.#route = cfg.route ? new Route(cfg.route, name) : null

    if (NGN.isFn(cfg)) {
      this.#on = this.#createHandler('on', cfg)
      return
    }

    if (NGN.typeof(cfg) !== 'object') {
      throw new TypeError(`State "${name}" configuration: Expected function or object, recieved ${NGN.typeof(cfg)}`)
    }

    this.#transitions = cfg.transitions ?? null

    this.#before = this.#createHandler('before', cfg.before)
    this.#onceBefore = this.#createHandler('onceBefore', cfg.onceBefore)
    this.#on = this.#createHandler('on', cfg.on)
    this.#once = this.#createHandler('once', cfg.once)
    this.#onceAfter = this.#createHandler('onceAfter', cfg.onceAfter)
    this.#after = this.#createHandler('after', cfg.after)
    this.#off = this.#createHandler('off', cfg.off)
  }

  get route () {
    return this.#route
  }

  get hasRoute () {
    return !!this.#route
  }

  get name () {
    return this.#name
  }

  get before () {
    return this.#before
  }

  get onceBefore () {
    return this.#onceBefore
  }

  get on () {
    return this.#on
  }

  get once () {
    return this.#once
  }

  get after () {
    return this.#after
  }

  get onceAfter () {
    return this.#onceAfter
  }

  get off () {
    return this.#off
  }

  get transitions () {
    return this.#transitions
  }

  hasTransition (name) {
    return Object.keys(this.#transitions).includes(name)
  }

  getTransition (name) {
    return this.#transitions[name]
  }

  #createHandler = (name, handler) => {
    if (!handler) {
      return null
    }

    if (!NGN.isFn(handler)) {
      throw new TypeError(`State "${this.#name}" configuration "${name}" handler: Expected function, received ${NGN.typeof(handler)}`)
    }

    return new StateHandler(name, handler)
  }
}
