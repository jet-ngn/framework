export function initializeStateManager (target, cfg) {
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
    get () {
      return machines 
    }
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
      if (StateMachine.prototype.hasOwnProperty(state)) {
        throw new Error(`Cannot create state on ${context.constructor.name}${context.name ? ` "${context.name}"` : ''}: "${state}" is a reserved word.`)
      }

      this.#states[state] = new State(context, state, states[state])
    })

    this.#currentState = this.#states.idle
    this.#currentState.on?.call(context, { previous: null })
  }

  get current () {
    return this.#currentState.name
  }

  get names () {
    return Object.keys(this.#states)
  }

  set (state, ...rest) {
    if (!this.has(state)) {
      throw new Error(`State "${state}" not found on state machine ${this.#name}`)
    }

    const previous = this.#currentState

    this.#currentState?.off?.call(this.#context, { current: previous.name, next: state }, ...rest)
    this.#currentState = this.#states[state]
    this.#currentState?.on?.call(this.#context, { previous: previous.name }, ...rest)
  }

  has (state) {
    return !!this[state]
  }

  transition (name, ...rest) {
    
  }
}

class State {
  #id = Symbol('state')

  #name
  #route = null
  #transitions = null

  #on = null
  #off = null

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