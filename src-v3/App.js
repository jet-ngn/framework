import AppRegistry from './registries/AppRegistry.js'
import EntityRegistry from './registries/EntityRegistry.js'
import history from './node_modules/history/browser.js'
import { matchRoute } from './utilities/RouteUtils.js'

export default class App {
  #name
  #version
  #root
  #routes
  #autostart = true
  #started = false

  constructor (node, config) {
    const { autostart, name, routes, version } = config

    this.#name = name ?? 'Unnamed App'
    this.#version = version ?? '0.0.1-alpha.1'
    this.#root = node
    this.#autostart = typeof autostart === 'boolean' ? autostart : this.#autostart
    this.#routes = routes ?? null

    AppRegistry.register(this)
  }

  get autostart () {
    return this.#autostart
  }

  get name () {
    return this.#name
  }

  get started () {
    return this.#started
  }

  get version () {
    return this.#version
  }

  start () {
    const { pathname } = history.location
    const initialRoute = matchRoute(pathname, Object.keys(this.#routes))

    console.log(initialRoute);

    // ERROR
    if (!initialRoute) {
      return console.log('Render 404 screen')
    }

    const { mount } = EntityRegistry.register(this.#root, this.#routes[initialRoute])

    mount(pathname.substring(initialRoute.length))
    this.#started = true
  }
}