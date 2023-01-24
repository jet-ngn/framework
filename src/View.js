import PermissionsManager from './session/PermissionsManager'
import Bus, { addHandler } from './events/Bus'
import { registerState } from './data/DataRegistry'
import { INTERNAL_ACCESS_KEY, RESERVED_EVENT_NAMES } from './env'

export class ViewPermissions extends Object {
  constructor (obj) {
    super()
    Object.keys(obj).forEach(key => this[key] = obj[key])
  }
}

export default class View extends PermissionsManager {
  #config
  #data
  #description
  #element
  #mounted = false
  #name
  #parent
  #permissions
  #scope
  #version

  constructor ({ parent = null, element = null, config = null } = {}) {
    const { data = null, description = null, name = null, on = {}, permissions = null, scope = null, version = null } = config
    super(permissions, 'view')
    
    this.#config = config
    this.#data = data ? registerState(data) : null
    this.#description = description
    this.#element = element
    this.#name = this.#name = name ?? this.id
    this.#parent = parent
    this.#permissions = permissions ? registerState(new ViewPermissions(permissions), false) : null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version

    new Map(Object.entries(on ?? {})).forEach((handler, evt) => addHandler(this, evt, handler))
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

  get element () {
    return this.#element
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

    const isReserved = RESERVED_EVENT_NAMES.includes(evt)

    if (isReserved && key !== INTERNAL_ACCESS_KEY) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    await Bus.emit(`${this.scope}.${evt}`, ...args)
    this.#mounted = evt === 'mount' ? true : evt === 'unmount' ? false : this.#mounted
  }

  find (...selectors) {
    selectors = selectors.map(selector => selector.trim())
    const result = []

    for (let selector of selectors) {
      result.push(...this.#element.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`))
    }
    return result
  }
}