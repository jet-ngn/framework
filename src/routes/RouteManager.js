import Route from './Route.js'

export default class RouteManager {
  #context
  #routes = {}

  #initial
  #previous
  #current

  constructor (context) {
    this.#context = context
  }

  get currentRoute () {
    return this.#current
  }

  get previousRoute () {
    return this.#previous
  }

  get initialRoute () {
    return this.#initial
  }

  addRoute (name, cfg) {
    if (this.hasRoute(name)) {
      throw new Error(`Route "${name}" already exists`)
    }

    this.#routes[name] = cfg
  }

  getRoute (name) {
    return this.#routes[name]
  }

  hasRoute (name) {
    return Object.keys(this.#routes).includes(name)
  }

  goto (route, payload, cfg = {}, initial = false) {
    if (!this.hasRoute(route.name)) {
      throw new Error(`Route "${route.name}" does not exist`)
    }

    route = route instanceof Route ? route : this.getRoute(route)
    this.#previous = this.#current
    this.#current = route

    if (!initial) {
      this.#context.emit('route.change', {
        previous: this.#previous ? this.#previous.toJSON() : null,
        current: this.#current.toJSON()
      })
    }

    const { state } = window.history
    const path = route.resolve(cfg)

    console.log(path);

    window.history[initial ? 'replaceState' : 'pushState']({
      name,
      path,
      payload,
      map: cfg?.map ?? {},
      hash: route.hash,
      query: route.query
    }, name, path)
  }
}
