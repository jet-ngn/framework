import { Bus } from './index.js'
import { getNamespacedEvent } from './utilities/EventUtils.js'
import { NANOID } from '@ngnjs/libdata'

export default class Entity {
  #id = NANOID()
  #name
  #scope
  #root
  #parent
  #children = []

  constructor (root, cfg, parent) {
    this.#name = cfg.name ?? `Unnamed Entity`
    this.#scope = cfg.scope ?? this.#id
    this.#root = root
    this.#parent = parent ?? null
  }

  get children () {
    return this.#children
  }

  get id () {
    return this.#id
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
    return `${this.parent ? `${this.parent.scope}.` : ''}${this.#scope}`
  }

  emit (evt, ...args) {
    if (!!reservedEventNames.includes(evt)) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    Bus.emit(getNamespacedEvent(this.scope, evt), ...args)
  }
}