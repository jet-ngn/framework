import { addHandler, emit } from './lib/events/Bus'
import { createID } from './utilities/IDUtils'
import { INTERNAL_ACCESS_KEY, RESERVED_EVENT_NAMES } from './env'

export default class View {
  #description
  #name
  #parent
  #rootNode
  #route
  #scope
  #version

  constructor (parent, rootNode, { data, description, name, on, permissions, scope, version } = {}, route) {
    const id = `view_${createID()}`

    this.#description = description ?? null
    this.#name = name ?? `${rootNode.tagName.toLowerCase()}::${id}${version ? `@${version}` : ''}`
    this.#parent = parent ?? null
    this.#rootNode = rootNode ?? null
    this.#route = route ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? id}`
    this.#version = version ?? null

    Object.keys(on ?? {}).forEach(evt => addHandler(this, evt, on[evt]))
  }

  get description () {
    return this.#description
  }

  get name () {
    return this.#name
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

  emit (evt, ...args) {
    let key = null

    if (typeof evt === 'symbol') {
      key = evt
      evt = args[0]
      args = args.slice(1)
    }

    if (!!RESERVED_EVENT_NAMES.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    emit(`${this.scope}.${evt}`, ...args)
  }
}