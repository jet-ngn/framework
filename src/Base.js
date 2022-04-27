import { BUS } from 'NGN'
import JetClass from './JetClass.js'
import { Trackable } from './Trackable.js'
import EventRegistry from './EventRegistry.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'

export default class Base extends JetClass {
  #data
  #description
  #name
  #root
  #scope
  #version

  constructor ({ data, description, name, on, root, scope, version }) {
    super()
    this.#data = !!data ? new Trackable(data) : {}
    this.#description = description ?? null
    this.#name = name ?? 'Unnamed Jet App'
    this.#root = root ?? null
    this.#scope = scope ?? this.id
    this.#version = version ?? '0.0.1'
    Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
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
}