import DOMEventListener from './DOMEventListener.js'

class DOMEventRegistry {
  #listeners = new Map

  add (entity, node, event, callback, options) {
    const applyListeners = !this.#hasEvent(event)
    const listener = new DOMEventListener(...arguments)

    this.#listeners.set({
      entity,
      event,
      id: listener.id,
      node,
      handler: listener.handler.id
    }, listener)

    if (['blur', 'focus'].includes(event)) {
      return node.addEventListener(event, evt => listener.handler.call(event))
    } else if (!!applyListeners) {
      this.#applyListeners(event)
    }

    return listener
  }

  removeByEntity (entity) {
    [...this.#listeners.keys()].filter(listener => listener.entity === entity).forEach(listener => this.#listeners.delete(listener))
  }

  removeByEvent (node, event, callback) {
    console.log('REMOVE', event, 'from', node)
    
    if (callback) {
      console.log('CALLBACK', callback)
    }
  }

  removeByNode (node) {
    console.log('REMOVE LISTENERS FROM', node)
  }

  #applyListeners (eventName) {
    return document.body.addEventListener(eventName, evt => {
      const { target } = evt

      ;[...this.#listeners.values()]
        .filter(({ node, event }) => (target === node || node.contains(target)) && event === eventName)
        .forEach(({ entity, handler }) => handler.call(entity, evt))
    })
  }

  #hasEvent (name) {
    return [...this.#listeners.keys()].some(({ event }) => event === name)
  }
}

export default new DOMEventRegistry