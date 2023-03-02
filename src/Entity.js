import { BINDINGS, TEMPLATES } from './env'
import EventEmitter from './EventEmitter'
import RouteManager from './RouteManager'
import StateManager from './StateManager'

function getWorkerManager (manager) {
  return manager ? new Promise((resolve, reject) => {
    manager.on('error', () => reject(manager))
    manager.on('ready', () => resolve(manager))
  }) : null
}

export default class Entity extends EventEmitter {
  #ready = false
  #initialized = false
  #connected = false

  #config
  #id = crypto.randomUUID()
  #element
  #router
  #state
  #range = document.createRange()
  #template

  constructor ({ baseURL, element, render, routes = null, state = null } = {}) {
    super()
    this.#config = arguments[0]
    this.#element = element
    this.#range.selectNode(this.#element)
    this.#template = TEMPLATES.get(this.#config) ?? (render ? render.call(this) : null)
    this.#template && TEMPLATES.set(this.#config, this.#template)

    Promise.all([
      routes ? getWorkerManager(new RouteManager(this, routes, baseURL)) : null,
      state ? getWorkerManager(new StateManager(this, state)) : null
    ]).then(async ([router, state]) => {
      this.#router = router
      this.#state = state
      this.#ready = true
      this.#initialized && await this.#render()
    })
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
    return this.#router?.routes ?? null
  }

  get state () {
    return this.#state?.proxy ?? null
  }

  get version () {
    return this.#config.version ?? null
  }

  async render () {
    if (!this.#connected) {
      let cont = await this.emit('connect') // TODO: Add  ACCESS_KEY
      
      if (!cont) {
        return await this.emit('aborted') // TODO: Add ACCESS_KEY
      }

      // TODO: Add Event Listeners, handle attributes/properties
      this.#template && this.#element.replaceChildren(this.#range.createContextualFragment(this.#template.raw))
      this.#initialized = true
    }
    
    this.#ready && await this.#render()
  }

  async #render () {
    let cont = true
    
    if (this.#connected) {
      cont = await this.emit('render') // TODO: Add ACCESS_KEY
    }

    if (aborted) {
      return await this.emit('aborted') // TODO: Add ACCESS_KEY
    }

    for (const id of this.#template.bindings) {
      const binding = BINDINGS.get(id)

      if (!binding.template) {
        binding.template = document.getElementById(id)
      }
      
      console.log(binding)
    }

    if (this.#connected) {
      return await this.emit('rendered') // TODO: Add ACCESS_KEY
    }

    this.#connected = true
    await this.emit('connected')
  }
}