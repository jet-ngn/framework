export default class User {
  #data
  #roles

  constructor ({ roles, data }) {
    this.#data = data ?? null
    this.#roles = [...new Set([...(roles ?? []), 'everyone'])]
  }

  get data () {
    return this.#data
  }

  get roles () {
    return this.#roles
  }

  hasRole (...roles) {
    return roles.some(role => this.#roles.includes(role))
  }
}