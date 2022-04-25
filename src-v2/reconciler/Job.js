export default class Job {
  #id = NGN.DATA.util.GUID()
  #name
  #callback
  #triggersLayout
  #data

  constructor (name, callback, data, triggersLayout = false) {
    this.#name = name
    this.#callback = callback
    this.#triggersLayout = triggersLayout
    this.#data = data
  }

  get data () {
    return this.#data
  }

  get id () {
    return this.#id
  }

  get name () {
    return this.#name
  }

  get callback () {
    return this.#callback
  }

  get triggersLayout () {
    return this.#triggersLayout
  }
}
