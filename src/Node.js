const getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

export default class Node {
  #source = null
  #revocable
  #test

  constructor (node) {
    this.#source = node
    
    this.#revocable = Proxy.revocable(node, {
      get: (target, property) => getValue(this, this[property]) ?? getValue(target, target[property]),
      set: (target, property, value) => Reflect.set((property in target) ? target : this, property, value)
    })

    return this.#revocable.proxy
  }

  get source () {
    return this.#source
  }

  remove () {
    // NGN.INTERNAL(`${this.constructor.name}.remove`, this)
    this.#source.remove()
    // NGN.INTERNAL(`${this.constructor.name}.removed`, this)
  }
}