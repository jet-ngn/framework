import TreeNode from './TreeNode'
import EventRegistry from './registries/EventRegistry'
import Bus from './Bus'
import { INTERNAL_ACCESS_KEY } from './env'

export default class View extends TreeNode {
  #description
  #name
  #route
  #scope
  #version

  constructor (parent, root, { description, name, on, scope, version }, route, idPrefix = 'view') {
    super(root, idPrefix)
    
    this.#description = description ?? null
    this.#name = name ?? `${root.tagName.toLowerCase()}::${this.id}${version ? `@${version}` : ''}`
    this.#route = route ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null

    Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
  }

  get description () {
    return this.#description
  }

  get name () {
    return this.#name
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

    if (!!EventRegistry.reservedNames.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    Bus.emit(`${this.scope}.${evt}`, ...args)
  }

  find (selector) {
    selector = selector.trim()
    return [...this.root.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`)]//.map(node => new Node(node))
  }
}