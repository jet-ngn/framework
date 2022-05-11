import IdentifiableClass from './IdentifiableClass'
import EventRegistry from './registries/EventRegistry'
import { Trackable } from './registries/TrackableRegistry'
import { BUS } from 'NGN'
import { INTERNAL_ACCESS_KEY } from './globals'

export default class View extends IdentifiableClass {
  #data
  #description
  #name
  #parent
  #root
  #scope
  #version

  constructor (parent, root, { data, description, name, scope, version }, prefix) {
    super(prefix ?? 'view')
    this.#data = new Trackable(data ?? {})
    this.#description = description ?? null
    this.#name = name ?? 'Unnamed Node'
    this.#parent = parent ?? null
    this.#root = root ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null
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

  get scope () {
    return this.#scope
  }

  get version () {
    return this.#version
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