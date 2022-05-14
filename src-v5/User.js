// import IAM from 'IAM'

export default class User {
  // #controller = IAM.User()
  #data
  #roles

  constructor ({ roles, data }) {
    this.#data = data ?? null
    this.#roles = roles ?? null
  }

  get data () {
    return this.#data
  }

  get roles () {
    return this.#roles
  }
}