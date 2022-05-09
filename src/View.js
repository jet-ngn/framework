import IdentifiableClass from './IdentifiableClass.js'

export default class View extends IdentifiableClass {
  #description
  #name
  #parent
  #root
  #scope
  #version

  constructor (parent, root, { data, description, name, routes, scope, version }, prefix) {
    super(prefix ?? 'view')
    // this.#data = new Trackable(data ?? {})
    this.#description = description ?? null
    this.#name = name ?? 'Unnamed Node'
    this.#parent = parent ?? null
    this.#root = root ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null
  }

  // get data () {
  //   return this.#data
  // }

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
}