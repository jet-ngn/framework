import ReferenceElement from './ReferenceElement.js'

export default class ReferenceCollection {
  #context
  #count = 0

  constructor (context) {
    this.#context = context
  }

  get length () {
    return this.#count
  }

  add (element) {
    const ref = new ReferenceElement(this.#context, this.#count, element, this)
    this[this.#count] = ref
    this.#count++

    if (ref.id) {
      this[ref.id] = ref
    }
  }

  forEach (cb) {
    for (let i = 0, length = this.#count; i < length; i++) {
      cb(this[i])
    }
  }

  item (index) {
    return this[index]
  }

  namedItem (name) {
    const matches = []

    for (let i = 0, length = this.#count; i < length; i++) {
      const ref = this[i]

      if (ref && (ref.id === name || ref.name === name)) {
        matches.push(ref)
      }
    }

    return matches.length > 0 ? matches[0] : null
  }

  remove (index) {
    const ref = this[index]

    if (ref.id) {
      delete this[ref.id]
    }

    delete this[index]
  }

  [Symbol.iterator] () {
    let index = 0

    return {
      next: () => {
        let result = {
          value: this[index],
          done: !(index in this)
        }

        index++
        return result
      }
    }
  }

  [Symbol.toStringTag] () {
    return 'ReferenceCollection'
  }
}
