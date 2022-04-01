import { NANOID } from "@ngnjs/libdata"

export default class Template {
  #id = NANOID()
  #type
  #strings
  #interpolations

  #attributes = null
  #listeners = null

  constructor ({ type, strings, interpolations }) {
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get attributes () {
    return this.#attributes
  }

  get id () {
    return this.#id
  }

  get interpolations () {
    return this.#interpolations
  }

  get listeners () {
    return this.#listeners
  }

  get strings () {
    return this.#strings
  }

  get type () {
    return this.#type
  }

  attr (cfg) {
    console.log(cfg);
    this.#attributes = { ...(this.#attributes ?? {}), ...cfg }
    return this
  }

  bind (entity) {
    console.log(entity)
    return this
  }

  on (evt, handler, cfg) {
    if (!this.#listeners) {
      this.#listeners = {}
    }

    if (typeof evt === 'object') {
      return this.#pool(evt)
    }

    if (this.#listeners.hasOwnProperty(evt)) {
      this.#listeners[evt].push({ handler, cfg })
    } else {
      this.#listeners[evt] = [{ handler, cfg }]
    }

    return this
  }

  #pool () {
    console.log('POOL');
  }
}