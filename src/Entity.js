import IdentifiedClass from './IdentifiedClass'

export default class Entity extends IdentifiedClass {
  #name
  #description
  #root
  #scope
  #version

  constructor (parent, root, { description, name, scope, version }, idPrefix = 'entity') {
    super(idPrefix)
    
    this.#description = description ?? null
    this.#name = name ?? null
    this.#root = root ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null
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

  emit () {
    console.log('TODO: WRITE EMIT FUNCTIONS')
  }
}