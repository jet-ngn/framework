export default class MethodManager {
  #context

  constructor (context, methods) {
    this.#context = context
    const type = NGN.typeof(methods)

    if (type !== 'object') {
      throw new TypeError(`Entity Configuration: "methods" expected object, received ${type}`)
    }

    Object.keys(methods).forEach(method => {
      this[method] = (...args) => methods[method].call(context, ...args)
    })
  }
}
