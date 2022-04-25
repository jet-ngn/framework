export default class ReferenceCollection {
  #references

  constructor (references = null) {
    if (NGN.typeof(references) !== 'array') {
      return console.error(`Invalid argument type "${NGN.typeof(references)}". ReferenceCollection expects an array.`)
    }

    this.#references = references

    this.#references.forEach((reference, index) => {
      this[index] = reference

      if (reference.id) {
        this[reference.id] = reference
      }
    })
  }

  get length () {
    return this.#references.length
  }

  forEach (cb) {
    this.#references.forEach(cb)
  }

  item (index) {
    return this[index]
  }

  namedItem (name) {
    let matches = this.#references.filter(reference => reference.id === name || reference.name === name)
    return matches.length > 0 ? matches[0] : null
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
