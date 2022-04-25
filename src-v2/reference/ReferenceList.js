export default class ReferenceList {
  #context

  constructor (context, root, selectors, elements) {
    this.#context = context
    this.root = root

    Object.keys(selectors).forEach(selector => {
      if (selector === 'root') {
        return
      }

      this[selector] = NGN.coalesce(this.#context.getReference(selector, this.root))
    })

    Object.keys(elements).forEach(element => {
      this[element] = NGN.coalesce(this.#context.getReference(element, this.root))
    })
  }

  get length () {
    return this.#context.length
  }

  add () {
    this.#context.addReference(...arguments)
  }

  remove () {
    this.#context.removeReference(...arguments)
  }

  get () {
    return this.#context.getReference(...arguments)
  }

  has () {
    return this.#context.hasReference(...arguments)
  }
}
