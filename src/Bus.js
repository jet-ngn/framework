const listeners = new Map

export default class Bus {
  static emit (name, ...args) {
    const handlers = listeners.get(name)

    handlers && handlers.forEach(handler => handler.call({
      event: name,
      remove: () => this.#remove(name, handlers, handler)
    }))
  }

  static on (name, handler) {
    const handlers = listeners.get(name)
    handlers ? handlers.push(handler) : listeners.set(name, [handler])
  }

  static off (name, handler) {
    return this.#remove(name, listeners.get(name), handler)
  }

  static #remove (name, handlers, handler) {
    if (!handlers) {
      return
    }

    if (!handler) {
      return listeners.delete(name)
    }

    listeners.set(name, handlers.filter(storedHandler => storedHandler !== handler))
  }
}