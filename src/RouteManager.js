import Route from './Route'

export default class RouteManager {
  #baseURL
  #routes

  constructor (baseURL, routes) {
    this.#baseURL = baseURL
    Object.keys(routes ?? {}).forEach(route => this.add(route, routes[route]))
  }

  add (path, config) {
    path = path.trim()
    routes[path] = new Route(new URL(path, this.#baseURL), config)
  }
}