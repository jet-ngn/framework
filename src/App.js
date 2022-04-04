import AppRegistry from './registries/AppRegistry.js'
import Entity from './Entity.js'
import EntityRegistry from './registries/EntityRegistry.js'

export default class App {
  #name
  #version
  #root
  #config
  #started = false
  #autostart = true

  constructor (node, config) {
    const { autostart, name, version } = config

    this.#name = name ?? 'Unnamed App'
    this.#version = version ?? '0.0.1-alpha.1'
    this.#root = node

    const type = typeof config

    if (type !== 'object') {
      throw new Error(`Invalid root node configuration. Expected object, received "${type}"`)
    }

    this.#autostart = typeof autostart === 'boolean' ? autostart : this.#autostart
    this.#config = config

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
    if (this.#started) {
      throw new Error(`App "${this.#name}" has already been started.`)
    }

    const entity = new Entity(this.#root, this.#config)

    EntityRegistry.register(entity, this.#config)
    EntityRegistry.mount(entity.id)
    this.#started = true
  }
}