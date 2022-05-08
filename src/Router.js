// import JetClass from './JetClass'

export class EmbeddedRouter {
  #routes

  constructor (routes) {
    // super()
    this.#routes = routes
  }

  get routes () {
    return this.#routes
  }
}

export function Router (routes) {
  return new EmbeddedRouter(routes)
  // const router = new EmbeddedRouter(routes)
  // return router
}