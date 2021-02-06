import { noop } from '../Utilities.js'
import RouteManager from '../routes/RouteManager.js'
import State from './State.js'
import StateChange from './StateChange.js'

export default class StateManager {
  #context
  #initialized = false
  #routeManager = null
  #states = {}

  #initial
  #previous
  #payload = null
  #current

  #handlers = function * () {
    yield 'before'
    yield 'onceBefore'
    yield 'on'
    yield 'once'
    yield 'after'
    yield 'onceAfter'
  }

  constructor (context, states, initial = 'idle') {
    this.#context = context
    Object.keys(states ?? {}).forEach(state => this.addState(state, states[state]))

    if (!this.#states.hasOwnProperty('idle')) {
      this.addState('idle', noop)
    }

    if (!this.hasState(initial)) {
      throw new Error(`Cannot set initial state to "${initial}" because there is no such state`)
    }

    this.#initial = this.#states[initial]
  }

  get currentRoute () {
    return this.#routeManager?.currentRoute ?? null
  }

  get currentState () {
    return this.#current
  }

  get previousRoute () {
    return this.#routeManager?.previousRoute ?? null
  }

  get previousState () {
    return this.#previous
  }

  get initialRoute () {
    return this.#routeManager?.initialRoute ?? null
  }

  get initialState () {
    return this.#initial
  }

  get states () {
    return Object.keys(this.#states)
  }

  addState (name, cfg) {
    if (this.hasState(name)) {
      throw new Error(`State "${name}" already exists`)
    }

    if (!(NGN.isFn(cfg) || NGN.typeof(cfg) === 'object')) {
      throw new TypeError(`State configuration expected function or object, received ${NGN.typeof(cfg)}`)
    }

    const state = new State(name, cfg)
    this.#states[name] = state

    if (!state.hasRoute) {
      return
    }

    if (!this.#routeManager) {
      this.#routeManager = new RouteManager(this.#context)
    }

    this.#routeManager.addRoute(state.name, state.route)
  }

  getState (name) {
    return this.#states[name]
  }

  setState (name, payload, routeConfig) {
    const state = this.#states[name]

    if (!state) {
      throw new Error(`State "${name}" does not exist`)
    }

    if (this.#current.name === name) {
      return
    }

    this.#execChange(state, payload, routeConfig)
  }

  hasState (name) {
    return Object.keys(this.#states).includes(name)
  }

  initialize () {
    if (this.#initialized) {
      throw Error(`${this.#context.type} "${this.#context.name}": State Manager already initialized`)
    }

    if (this.#routeManager) {
      this.#enablePopHandler()
    }

    const initial = this.#getStateMatchingRoute(window.location) ?? this.#initial

    this.#initializeState(initial, {
      previous: null,
      current: {
        state: initial.name,
        route: initial.route ? initial.route.toJSON() : null
      }
    }, null, null, true)

    this.#initialized = true
  }

  removeState (state) {
    if (!this.hasState(state)) {
      return console.error(`State "${state}" not found`)
    }

    if (state === 'idle') {
      return console.error(`Cannot remove idle state.`)
    }

    if (this.#current.name === state) {
      console.warn(`"${state}" is the currently active state. Reverting to idle state...`)
      this.setState('idle')
    }

    delete this.#states[state]
  }

  transition (name, payload, routeConfig) {
    let transition = this.#current.getTransition(name)

    if (!transition) {
      throw new Error(`"${name}" is not a valid transition on the "${this.#current.name}" state`)
    }

    if (NGN.isFn(transition)) {
      return transition.call(this.#context, payload, routeConfig)
    }

    if (NGN.typeof(transition) !== 'string') {
      throw new Error('Invalid Transition Configuration')
    }

    this.setState(transition, payload, routeConfig)
  }

  #enablePopHandler = () => {
    window.addEventListener('popstate', evt => {
      if (!evt.state) {
        return
      }

      let { hash, map, name, payload, query } = evt.state

      if (this.has(name)) {
        return this.#execChange(this.getState(name), payload, { hash, map, query })
      }

      // TODO: Throw Error
    })
  }

  #execChange = (state, payload = null, routeConfig) => {
    const currentRoute = this.currentRoute ? this.currentRoute.toJSON() : null

    const change = new StateChange({
      current: {
        state: this.#current.name,
        route: currentRoute
      },

      next: {
        state: state.name,
        route: state.route ? state.route.toJSON() : null
      }
    })

    this.#context.emit('state.change', {
      current: change.current,
      next: change.next,
      abort: () => change.abort()
    })

    if (change.aborted) {
      return
    }

    let properties = {
      previous: {
        state: this.#current.name,
        route: currentRoute
      },

      current: {
        state: state.name,
        route: state.route ? state.route.toJSON() : currentRoute
      }
    }

    const { name, off } = this.#current

    if (off) {
      off.execute(this.#context, {
        current: properties.previous,
        next: properties.current
      }, this.#payload)
    }

    this.#initializeState(state, properties, payload, routeConfig)

    properties = {
      current: {
        state: this.#current.name,
        route: this.currentRoute ? this.currentRoute.toJSON() : null
      }
    }

    if (this.#previous) {
      return this.#context.emit('state.changed', {
        ...properties,
        previous: {
          state: this.#previous.name,
          route: this.previousRoute ? this.previousRoute.toJSON() : null
        }
      })
    }

    this.#context.emit('state.initialize', properties.current, payload)
  }

  #getStateMatchingRoute = location => Object.values(this.#states).find(state => {
    return state.route ? state.route.matches(location.pathname) : false
  }) ?? null

  #initializeState = (state, properties, payload, routeConfig, initial = false) => {
    const { name, route } = state

    if (route) {
      this.#routeManager.goto(route, payload, routeConfig, initial && name === this.#initial.name)
    }

    const handlers = this.#handlers()
    let completed = false

    while (!completed) {
      const { value, done } = handlers.next()
      // console.log(state);
      const handler = state[value]
      // console.log(handler);
      completed = done

      if (!handler || (handler.runsOnceOnly && handler.executions > 0)) {
        continue
      }

      handler.execute(this.#context, properties.previous, payload)
    }

    this.#payload = payload
    this.#previous = this.#current
    this.#current = state
  }
}
