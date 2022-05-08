import { BUS } from 'NGN'
import JetClass from './JetClass.js'
import { Trackable } from './Trackable.js'
import EventRegistry from './EventRegistry.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'

export default class View extends JetClass {
  #children = []
  #data
  #description
  #name
  #parent
  #root
  #route
  #routes
  #scope
  #version

  constructor (parent, root, { data, description, name, on, routes, scope, version }, route, options) {
    super()
    this.#data = !!data ? new Trackable(data) : {}
    this.#description = description ?? null
    this.#name = name ?? 'Unnamed View'
    this.#parent = parent ?? null
    this.#root = root ?? null //? new Node(root) : null
    this.#route = route ?? null
    this.#routes = routes ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null
    Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
    Object.keys(options?.listeners ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, options.listeners[evt]))
  }

  get children () {
    return this.#children
  }

  get data () {
    return this.#data
  }

  get description () {
    return this.#description
  }

  get name () {
    return this.#name
  }

  get parent () {
    return this.#parent
  }

  get root () {
    return this.#root
  }

  get route () {
    return this.#route
  }

  get routes () {
    return this.#routes
  }

  get scope () {
    return this.#scope
  }

  get version () {
    return this.#version
  }

  attachRouter (node, routes) {
    return RouteRegistry.attachRouter(this, node, routes)
  }

  emit (evt, ...args) {
    let key = null

    if (typeof evt === 'symbol') {
      key = evt
      evt = args[0]
      args = args.slice(1)
    }

    if (!!EventRegistry.reservedNames.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    BUS.emit(`${this.#scope}.${evt}`, ...args)
  }

  find (selector) {
    selector = selector.trim()
    return [...this.root.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`)]//.map(node => new Node(node))
  }
}