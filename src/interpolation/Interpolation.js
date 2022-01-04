export default class Interpolation {
  #context
  #value
  #retainFormatting
  rendered = null
  id = null

  constructor (context, value, retainFormatting) {
    this.#context = context
    this.#value = value
    this.#retainFormatting = retainFormatting ?? false
  }

  get context () {
    return this.#context
  }

  get parentNode () {
    return this.rendered.parentNode
  }

  get retainFormatting () {
    return this.#retainFormatting
  }

  get value () {
    return this.#value
  }

  replaceWith (update) {
    this.rendered.replaceWith(update)
  }
}
