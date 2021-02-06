import Template from '../renderer/Template.js'
import Renderer from '../renderer/Renderer.js'

export default class Interpolation {
  #context
  #value
  #index
  #retainFormatting
  rendered = null

  constructor (context, interpolation, index, retainFormatting) {
    this.#context = context
    this.#value = interpolation
    this.#index = index
    this.#retainFormatting = retainFormatting ?? false
  }

  get context () {
    return this.#context
  }

  get id () {
    return `i${this.#index}`
  }

  get index () {
    return this.#index
  }

  set index (index) {
    this.#index = index
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
