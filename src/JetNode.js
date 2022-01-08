export default class JetNode {
  #source = null
  #revocable

  #getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

  constructor (node) {
    this.#source = node
    
    this.#revocable = Proxy.revocable(node, {
      get: (target, property) => this.#getValue(this, this[property]) ?? this.#getValue(target, target[property]),
      set: (target, property, value) => Reflect.set((property in target) ? target : this, property, value)
    })

    return this.#revocable.proxy
  }

  get source () {
    return this.#source
  }

  remove () {
    NGN.INTERNAL(`${this.constructor.name}.remove`, this)
    this.#revocable.revoke()
    this.#source.remove()
    NGN.INTERNAL(`${this.constructor.name}.removed`, this)
    this.#source = null
  }
}