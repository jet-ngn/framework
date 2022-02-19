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

  async set (state, payload, route) {
    if (!this.has(state)) {
      throw new Error(`State "${state}" not found on state machine ${this.#name}`)
    }

    const previous = this.#currentState

    await previous?.off?.call(this.#context, { current: previous.name, next: state }, payload)
    this.#currentState = this.#states[state]
    await this.#currentState?.on?.call(this.#context, { previous: previous?.name ?? null }, payload)
  }

  has (state) {
    return !!this.#states.hasOwnProperty(state)
  }

  async transition (name, ...rest) {
    const transition = this.#currentState.getTransition(name)

    if (!this.#currentState.hasTransition(name)) {
      throw new Error(`Transition "${name}" not found on "${this.#currentState.name}" state of state machine ${this.#name}`)
    }

    if (typeof transition === 'function') {
      return transition.call(this.#context, ...rest)
    }

    this.set(transition, ...rest)
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
      if (!['string', 'function'].includes(typeof transition)) {
        throw new TypeError(`Invalid "${this.#name}" state configuration. Transition "${name}" expected string or function, received ${typeof transition}`)
      }

      result[transition] = transitions[transition]
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
    return Object.keys(this.#transitions ?? {}).includes(name)
  }

  getTransition (name) {
    return (this.#transitions ?? {})[name]
  }
}

class Route extends URL {
  resolvePath (map) {
    if (!map) {
      return this.pathname
    }

    const parts = this.pathname.split('/').filter(Boolean)

    return '/' + parts.map(part => {
      if (!part.startsWith(':')) {
        return part
      }

      let interp = map[part.substring(1)]

      if (!interp) {
        throw new Error(`Route config object does not contain a property called "${part.substring(1)}"`)
      }

      return interp
    }).join('/')
  }
}

// const test = new Route('jet:/test/:id')

// const path = test.resolvePath({ id: 'blah' })

// console.log(path);

// class Route {
//   #name
//   #path = null
//   #hash = null
//   #query = null
// }