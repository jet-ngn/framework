export default class ParsedNode {
  #context
  #hidden = false
  #placeholder = document.createComment('PLACEHOLDER')

  constructor (source, context) {
    this.#context = context
    this.source = source.cloneNode()
  }

  get context () {
    return this.#context
  }

  get hidden () {
    return this.#hidden
  }

  get nextSibling () {
    return this.source.nextSibling
  }

  get parentNode () {
    return this.source.parentNode
  }

  get previousSibling () {
    return this.source.previousSibling
  }

  insertAfter (fragment) {
    this.parentNode.insertBefore(fragment, this.nextSibling)
  }

  remove () {
    this.source.remove()
  }

  replaceWith (node) {
    this.source.replaceWith(node)
  }

  hide () {
    this.replaceWith(this.#placeholder)
    this.#hidden = true
  }

  show () {
    this.#placeholder.replaceWith(this.source)
    this.#hidden = false
  }
}
