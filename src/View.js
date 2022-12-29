import PermissionsManager from './lib/session/PermissionsManager'
import Bus, { addHandler } from './lib/events/Bus'
import { registerState } from './lib/data/DataRegistry'
import { INTERNAL_ACCESS_KEY, RESERVED_EVENT_NAMES, PATH } from './env'

export class ViewPermissions extends Object {
  constructor (obj) {
    super()
    Object.keys(obj).forEach(key => this[key] = obj[key])
  }
}

export default class View extends PermissionsManager {
  #children = new Set
  #config
  #data
  #description
  #mounted = false
  #name
  #parent
  #permissions
  #rootNode
  #route
  #scope
  #version

  constructor (parent, rootNode, { data, description, name, on, permissions, scope, version } = {}, route) {
    super(permissions, 'view')

    this.#config = arguments[2]
    this.#data = data ? registerState(data) : null
    this.#description = description ?? null
    this.#name = name ?? `${rootNode.tagName.toLowerCase()}::${this.id}${version ? `@${version}` : ''}`
    this.#parent = parent ?? null
    this.#permissions = permissions ? registerState(new ViewPermissions(permissions), false) : null
    this.#rootNode = rootNode ?? null
    this.#route = route ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null

    Object.keys(on ?? {}).forEach(evt => addHandler(this, evt, on[evt]))
  }

  get children () {
    return this.#children
  }

  get config () {
    return this.#config
  }

  get data () {
    return this.#data
  }

  get description () {
    return this.#description
  }

  get hasRoutes () {
    return !!this.#config.routes
  }

  get mounted () {
    return this.#mounted
  }

  get name () {
    return this.#name
  }

  get parent () {
    return this.#parent
  }

  get permissions () {
    return this.#permissions
  }

  get rootNode () {
    return this.#rootNode
  }

  get route () {
    return this.#route
  }

  get scope () {
    return this.#scope
  }

  get version () {
    return this.#version
  }

  async emit (evt, ...args) {
    let key = null

    if (typeof evt === 'symbol') {
      key = evt
      evt = args[0]
      args = args.slice(1)
    }

    if (!!RESERVED_EVENT_NAMES.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    switch (evt) {
      case 'mount':
        this.#mounted = true
        break

      case 'unmount':
        this.#mounted = false
        break

      case 'reconcile': return this.#route.update()
    }

    await Bus.emit(`${this.scope}.${evt}`, ...args)
  }

  find (...selectors) {
    selectors = selectors.map(selector => selector.trim())
    const result = []

    for (let selector of selectors) {
      result.push(...this.#rootNode.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`))
    }
    return result
  }
}