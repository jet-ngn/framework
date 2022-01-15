const JetProxy = (superClass, { name }) => class extends superClass {
  #target = null
  #revocable

  #getTrap = (target, property) => this.#getValue(this, this[property]) ?? this.#getValue(target, target[property])
  #getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

  constructor (target) {
    super(...arguments)
    this.#target = target

    this.#revocable = Proxy.revocable(target, {
      get: (target, property) => this.#getTrap(target, property),
      set: (target, property, value) => {
        this.emit(`${name}.set`, {
          target,
          property,
          value: {
            new: value,
            old: this.#getTrap(target, property)
          }
        })

        return Reflect.set((property in target) ? target : this, property, value)
      }
    })

    return this.#revocable.proxy
  }

  get target () {
    return this.#target
  }

  destroy () {
    this.#revocable.revoke()
    this.#target = null
  }
}

export { JetProxy as default }