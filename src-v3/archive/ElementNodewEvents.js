export default class ElementNode {
  #source = null
  #revocable
  #eventListeners = []
  
  #getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

  constructor (element) {
    this.#source = element
    
    this.#revocable = Proxy.revocable(element, {
      get: (target, property) => this.#getValue(this, this[property]) ?? this.#getValue(target, target[property]),
      set: (target, property, value) => Reflect.set((property in target) ? target : this, property, value)
    })

    return this.#revocable.proxy
  }

  remove () {
    NGN.INTERNAL(`${this.constructor.name}.remove`, this.#eventListeners)
    this.#revocable.revoke()
    this.#source.remove()
    NGN.INTERNAL(`${this.constructor.name}.removed`, this)
    this.#source = null
  }
}