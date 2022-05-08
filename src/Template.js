import IdentifiableClass from './IdentifiableClass.js'

export default class Template extends IdentifiableClass {
  #type
  #strings
  #interpolations

  #view = null

  constructor (type, strings, ...interpolations) {
    super('template')
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get interpolations () {
    return this.#interpolations
  }

  get strings () {
    return this.#strings
  }

  get type () {
    return this.#type
  }

  get view () {
    return this.#view
  }

  bindView (view) {
    this.#view = view
    return this
  }
}