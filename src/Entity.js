import RouteManager from './RouteManager'
import StateManager from './StateManager'

function getWorkerManager (manager) {
  return new Promise((resolve, reject) => {
    manager.on('error', () => reject(manager))
    manager.on('ready', () => resolve(manager))
  })
}

export default class Entity {
  #ready = false
  #initialized = false

  #config
  #id = crypto.randomUUID()
  #router
  #state

  constructor ({ baseURL, state = null, routes = null } = {}) {
    this.#config = arguments[0]

    Promise.all([
      getWorkerManager(new RouteManager(this, routes, baseURL)),
      getWorkerManager(new StateManager(this, {}, state ?? null))
    ]).then(([router, state]) => {
      this.#router = router
      this.#state = state
      this.#ready = true
      this.#initialized && this.#render()
    })
  }

  get state () {
    return this.#state?.proxy ?? null
  }

  get description () {
    return this.#config.description ?? null
  }

  get id () {
    return this.#id
  }

  get name () {
    return this.#config.name ?? `App ${this.#id}`
  }

  get routes () {
    return this.#router.routes
  }

  get version () {
    return this.#config.version ?? null
  }
  
  render () {
    this.#initialized = true
    this.#ready && this.#render()
  }

  #render () {
    console.log('RENDER', this)
  }
}