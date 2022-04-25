export default class ReferenceElementProxy {
  #element

  constructor (element) {
    this.#element = element ?? null

    if (!this.#element) {
      return
    }

    return new Proxy(this, {
      get (target, property) {
        if (!!target[property]) {
          return target[property]
        }

        if (property in target.element) {
          target = target.element
          const entity = target[property]

          if (typeof entity === 'function') {
            return function (...args) {
              return entity.apply(target, args)
            }
          }
        }

        return Reflect.get(target, property)
      },

      set (target, property, value) {
        return Reflect.set((property in target.element) ? target.element : target, property, value)
      }
    })
  }

  get element () {
    return this.#element
  }
}
