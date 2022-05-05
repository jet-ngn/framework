import { NANOID } from '@ngnjs/libdata'
import IAM from 'IAM'

export default class User {
  // #controller = IAM.User()
  #data
  #id = NANOID()
  #roles

  constructor ({ id, roles, data }) {
    this.#data = data ?? null
    this.#id = id ?? null
    this.#roles = roles ?? null
  }

  get data () {
    return this.#data
  }

  get id () {
    return this.#id
  }

  get roles () {
    return this.#roles
  }

  // get isValid () {
  //   return this.#model.valid
  // }

  // get invalidFields () {
  //   return this.#model.invalidDataAttributes
  // }
}