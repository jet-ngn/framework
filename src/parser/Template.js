import IdentifiedClass from '../IdentifiedClass'

export default class Template extends IdentifiedClass {
  #strings
  #interpolations

  constructor (strings, interpolations, idPrefix) {
    super(idPrefix)
    this.#strings = [...strings]
    this.#interpolations = [...interpolations]
  }

  get interpolations () {
    return this.#interpolations
  }

  get strings () {
    return this.#strings
  }
}