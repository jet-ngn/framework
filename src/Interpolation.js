import { UUID } from 'NGN/libdata'

export default class Interpolation {
  #id = UUID()

  get id () {
    return this.#id
  }
}