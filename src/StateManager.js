export function initializeStateManager (target, cfg) {
  let groups = []
  let current = null

  if (!Array.isArray(cfg)) {
    cfg = [cfg]
  }

  // cfg.forEach(group => {
  //   groups.push(Object.keys(group).reduce((states, name) => {
  //     states[name] = new State(target, group[name])
  //     return states
  //   }, {}))
  // })

  // const manager = new StateManager(target, groups)
  const manager = {}

  cfg.forEach((group, index) => {
    Object.defineProperty(manager, index, {
      value: Object.keys(group).reduce((states, state) => {
        states[state] = new State(target, state, group[state])
        return states
      }, {})
    })
  })
  // Object.defineProperties(manager, cfg.reduce((groups, group, index) => {
  //   // groups[index] = Object.keys(group).reduce((states, state) => {
  //   //   states[state] = new State(target, group[state])
  //   //   return states
  //   // }, {})

  //   groups[index] = group

  //   return groups
  // }, {}))

  Object.defineProperty(target, 'states', {
    get () {
      return manager
    }
  })

  // states = new StateCollection(target, cfg)

  // Object.defineProperty(target, 'state', {
  //   get: () => states.currentStates,
  //   set: name => states.set(name)
  // })
}

// export function attachStateManager (obj) {
//   Object.defineProperties(obj.prototype, {
//     addState: (name, cfg) => groups.push(new State(name, cfg))
//   })
// }

class State {
  #id = Symbol('state')
  #context

  #name
  #route = null
  #transitions = null

  #on = null
  #off = null

  constructor (context, name, cfg) {
    this.#context = context
    this.#name = name
    
    if (typeof cfg === 'function') {
      this.#on = cfg
      return
    }

    if (typeof cfg !== 'object') {
      throw new TypeError(`Invalid ${context.constructor.name} state "${name}" configuration. Expected object or function, received ${typeof cfg}`)
    }

    const { on, off, route, transitions } = cfg

    this.#on = on ?? null
    this.#off = off ?? null
    this.#route = route ? new Route(route, name) : null
    
    this.#transitions = transitions ? Object.keys(transitions).reduce((result, transition) => {
      result[transition] = new Transition(transition, transitions[transition])
      return result
    }, {}) : null
  }

  get name () {
    return this.#name
  }

  get on () {
    return this.#on
  }

  get off () {
    return this.#off
  }

  get route () {
    return this.#route
  }

  get hasRoute () {
    return !!this.#route
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

class Route {

}

class Transition {

}