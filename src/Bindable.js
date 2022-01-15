import NGN from 'NGN'

export default class Bindable extends NGN.EventEmitter {
  #id = Symbol('bindable')
  #revocable
  #observedProps = []

  constructor (target) {
    super()

    const getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null
    const getTrap = (target, property) => getValue(this, this[property]) ?? getValue(target, target[property])

    this.#revocable = Proxy.revocable(target, {
      get: (target, property) => getTrap(target, property),
      
      set: (target, property, value) => {
        if (this.#observedProps.includes(property)) {
          value = {
            new: value,
            old: getTrap(target, property)
          }

          this.emit(`${name}.set`, { target, property, value })
          this.emit(`${name}.${property}.set`, { target, value })
        }

        return Reflect.set((property in target) ? target : this, property, value)
      }
    })
  }

  get id () {
    return this.#id
  }
}