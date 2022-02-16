export function attachStateManager (target, cfg) {
  if (!Array.isArray(cfg)) {
    cfg = [cfg]
  }

  const machines = cfg.reduce((result, group, index) => {
    const machine = new StateMachine(target, index, group, index === 0)
  
    Object.defineProperty(result, index, {
      get: () => machine,
      set: state => machine.set(state)
    })

    return result
  }, {})

  Object.defineProperty(target, 'states', {
    get: () => machines 
  })
}

class StateMachine {
  #context
  #name
  #states = {}
  #currentState = null

  constructor (context, name, states, isDefault = false) {
    this.#context = context
    this.#name = name

    states = states ?? {}

    if (isDefault && !states.hasOwnProperty('idle')) {
      states.idle = () => {}
    }
    
    Object.keys(states).forEach(state => {
      this.#states[state] = new State(context, state, states[state])
    })
  }

  get current () {
    return this.#currentState?.name ?? null
  }

  get names () {
    return Object.keys(this.#states)
  }

  set (state, ...rest) {
    if (!this.has(state)) {
      throw new Error(`State "${state}" not found on state machine ${this.#name}`)
    }

    const previous = this.#currentState

    previous?.off?.call(this.#context, { current: previous.name, next: state }, ...rest)
    this.#currentState = this.#states[state]
    this.#currentState?.on?.call(this.#context, { previous: previous?.name ?? null }, ...rest)
  }

  has (state) {
    return !!this.#states.hasOwnProperty(state)
  }

  transition (name, ...rest) {
    
  }
}

class State {
  #id = Symbol('state')

  #name
  #route = null
  #transitions = null

  constructor (context, name, cfg) {
    this.#name = name
    
    if (typeof cfg === 'function') {
      cfg = {
        on: cfg
      }
    }

    if (typeof cfg !== 'object') {
      throw new TypeError(`Invalid ${context.constructor.name} state "${name}" configuration. Expected object or function, received ${typeof cfg}`)
    }

    ;['on', 'off'].forEach(name => {
      const handler = cfg[name]

      handler && Object.defineProperty(this, name, {
        get: () => handler
      })
    })

    const { transitions } = cfg

    this.#transitions = transitions ? Object.keys(transitions).reduce((result, transition) => {
      result[transition] = new Transition(context, transition, transitions[transition])
      return result
    }, {}) : null
  }

  get name () {
    return this.#name
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
}

class Transition {
  #context
  #name

  constructor (context, name, cfg) {
    this.#context = context
    this.#name = name
  }

  get name () {
    return this.#name
  }
}