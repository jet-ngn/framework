// TODO: Add AbortController to EventHandler class
// Usage within handler function: this.abort()

export default class EventEmitter {
  #listeners = new Map

  // If aborted, return false from this function. Otherwise, return true
  // Or, maybe the event handler should just be able to return true or false. If false,
  // abort. This would negate the need for this.abort(), although the method call might
  // be clearer.
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