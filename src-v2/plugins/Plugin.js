export default class Plugin {
  #name
  #initFn
  #dependencies = null

  constructor ({ name, initialize, dependencies = [] }) {
    if (!name) {
      throw new Error(`Plugin: "name" attribute is required.`)
    }

    if (!initialize) {
      throw new Error(`Plugin: Initialization function is required`)
    }

    const type = typeof initialize

    if (type !== 'function') {
      throw new Error(`Invalid initialization function: Expected function, received ${type}`)
    }

    this.#name = name
    this.#initFn = initialize
  }

  get name () {
    return this.#name
  }

  get initialize () {
    return this.#initFn
  }

  // initialize () {
  //   console.log(...arguments);
  //   return this.#initFn.call(...arguments)
  // }

  // initialize (context, ...rest) {
  //   return
  // }
}
