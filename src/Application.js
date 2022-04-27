import Base from './Base.js'
import RouteManager from './RouteManager.js'

export default class Application extends Base {
  #routeManager

  constructor ({ baseURL, name, on, routes, selector }) {
    super({
      ...arguments[0],
      name: name ?? 'Unnamed Jet App',
      root: document.querySelector(selector ?? 'body')
    })
    
    this.#routeManager = new RouteManager(routes ?? {}, baseURL)
  }

  get routes () {
    return this.#routeManager
  }

  addRoute () {
    console.log('ADD ROUTE')
  }
}