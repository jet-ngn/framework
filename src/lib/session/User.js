export default class User {
  #data
  #roles

  constructor ({ roles, data }) {
    this.#data = data ?? null
    this.#roles = Array.from(new Set([...(roles ?? []), 'everyone']))
  }

  get data () {
    return this.#data
  }

  get roles () {
    return this.#roles
  }
}