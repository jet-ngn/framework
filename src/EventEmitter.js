export default class EventEmitter {
  #listeners = new Map

  async emit (name, ...args) {
    const handlers = this.#listeners.get(name)

    if (!handlers) {
      return
    }

    for (const handler of handlers) {
      await handler.call({
        event: name,
        remove: () => this.#remove(name, handlers, handler)
      }, ...args)
    }
  }

  off (name, handler) {
    return this.#remove(name, listeners.get(name), handler)
  }

  on (name, handler) {
    const handlers = this.#listeners.get(name)
    handlers ? handlers.push(handler) : this.#listeners.set(name, [handler])
  }

  #remove (name, handlers, handler) {
    if (!handlers) {
      return
    }
  
    if (!handler) {
      return this.#listeners.delete(name)
    }
  
    handlers.splice(handlers.indexOf(handler))
    
    if (handlers.length === 0) {
      return this.#listeners.delete(name)
    }
  
    this.#listeners.set(name, handlers)
  }
}