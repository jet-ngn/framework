export default class Template {
  #type
  #strings
  #interpolations

  constructor ({ type, strings, interpolations }) {
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

  attr (cfg) {
    console.log(cfg)
    return this
  }

  bind (entity) {
    console.log(entity)
    return this
  }

  on (evt, handler, cfg) {
    if (typeof evt === 'object') {
      return this.#pool(evt)
    }

    console.log(evt, handler, cfg)
    return this
  }

  #pool () {
    console.log('POOL');
  }
}