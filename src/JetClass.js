import { NANOID } from '@ngnjs/libdata'

export default class JetClass {
  #id = NANOID()

  get id () {
    return this.#id
  }
}