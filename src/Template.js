import IdentifiableClass from './IdentifiableClass.js'

export default class Template extends IdentifiableClass {
  #type
  #strings
  #interpolations

  #viewConfig = null

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

  get viewConfig () {
    return this.#viewConfig
  }

  bindView (config) {
    this.#viewConfig = config
    return this
  }
}