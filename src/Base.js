import JetClass from './JetClass.js'

export default class Base extends JetClass {
  #description
  #name
  #root
  #scope
  #version

  constructor ({ description, name, root, scope, version }) {
    super()
    this.#description = description ?? null
    this.#name = name ?? 'Unnamed Jet App'
    this.#root = root ?? null
    this.#scope = scope ?? this.id
    this.#version = version ?? '0.0.1'
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
}