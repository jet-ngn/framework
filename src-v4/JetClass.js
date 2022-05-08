import { NANOID } from '@ngnjs/libdata'

export default class JetClass {
  #id = NANOID()

  constructor (id) {
    this.#id = id ?? this.#id
  }

  get id () {
    return this.#id
  }
}