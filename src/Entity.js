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
  #rendered = false

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
    this.#template = render ? render.call(this) : null
    this.#router = routes ? getWorkerManager(new RouteManager(this, routes, baseURL)) : null
    this.#state = state ? getWorkerManager(new StateManager(this, state)) : null

    Promise.all([this.#router, this.#state]).then(([router, state]) => {
      this.#router = router
      this.#state = state
      this.#ready = true
      this.#rendered && this.#update()
    })
  }

  // get config () {
  //   return this.#config
  // }

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

  render () {
    if (!this.#rendered) {
      this.#element.replaceChildren(this.#range.createContextualFragment(this.#template.raw))
      this.#rendered = true
    }

    this.#ready && this.#update()
  }

  #update () {
    console.log(this);
    // for (const { type, id } of this.#template.interpolations) {
    //   const template = document.getElementById(id)
    //   console.log(template)
    // }
  }
}