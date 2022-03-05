import EventHandler from '../events/EventHandler.js'
import ReferenceElement from '../reference/ReferenceElement.js'
import ElementNode from '../parser/ElementNode.js'

export class DOMEventRegistry {
  #root
  #registry = {}
  #elements = []
  #handlers = {}

  constructor (root) {
    this.#root = root
  }

  deregister (element, evt, handler) {
    if (evt === 'all') {
      return this.#removeAllElementHandlers(element)
    }

    const elements = this.#registry[evt] ?? null

    if (!elements) {
      throw new Error(`"${evt}" event not registered`)
    }

    const handlers = elements.get(element)

    if (!handlers) {
      try {
        throw new Error(`Element has no registered event handlers`)
      } catch (e) {
        console.error(e.message)
        return console.info(element)
      }
    }

    if (handler) {
      handlers.splice(handlers.indexOf(handler))
    } else {
      elements.delete(element)
    }

    if (handlers.length === 0) {
      elements.delete(element)
    }

    if (elements.size === 0) {
      this.#remove(evt)
    }
  }

  getElementHandlersByEvent (element, evt) {
    const elements = this.#registry[evt]

    if (!elements) {
      return []
    }

    const stored = elements.get(element)

    if (!stored) {
      return []
    }

    return stored
  }

  getAllElementHandlers (element) {
    const handlers = {}

    Object.keys(this.#registry).forEach(evt => {
      const stored = this.getElementHandlersByEvent(element, evt)

      if (stored.length === 0) {
        return
      }

      if (handlers.hasOwnProperty[evt]) {
        handlers[evt].push(...stored)
      } else {
        handlers[evt] = stored
      }
    })

    return handlers
  }

  elementHasHandlers (element) {
    return Object.keys(this.#registry).some(evt => {
      return this.#registry[evt].has(element)
    })
  }

  elementHasHandlersByEvent (element, evt) {
    return !!this.getElementHandlersByEvent(...arguments)
  }

  hasHandler (name) {
    return Object.keys(this.#handlers).includes(name)
  }

  register (context, element, evt, callback, cfg) {
    const handlers = [new EventHandler(context, evt, cfg, callback)]

    if (!this.hasHandler(evt)) {
      this.#registry[evt] = new Map([[element, handlers]])
      return this.#apply(evt)
    }

    const elements = this.#registry[evt]

    if (!elements.has(element)) {
      return elements.set(element, handlers)
    }

    elements.get(element).push(handlers[0])
  }

  removeElement (element) {
    Object.keys(this.#handlers).forEach(evt => {
      const elements = this.#registry[evt]

      if (element.hasChildren) {
        element.nodes.forEach(node => {
          if (node instanceof ElementNode) {
            this.removeElement(node)
          }
        })
      }

      if (elements.has(element)) {
        this.deregister(element, 'all')
      }
    })
  }

  #apply = evt => {
    this.#handlers[evt] = this.#getHandler(evt)
    this.#root.addEventListener(evt, this.#handlers[evt])
  }

  #getHandler = name => evt => {
    const { target } = evt
    const elements = this.#registry[name]
    const cleanup = []

    for (let [element, handlers] of elements) {
      const source = element[element instanceof ReferenceElement ? 'element' : 'source']

      if (target === source || source.contains(target)) {
        handlers.forEach(handler => {
          const { action } = handler.call(evt)

          switch (action) {
            case 'delete': return cleanup.push(() => handlers.splice(handlers.indexOf(handler)))
          }
        })

        break
      }
    }

    cleanup.forEach(func => func())
  }

  #remove = evt => {
    this.#root.removeEventListener(evt, this.#handlers[evt])
    delete this.#registry[evt]
    delete this.#handlers[evt]
  }

  #removeAllElementHandlers = element => {
    Object.keys(this.#registry).forEach(evt => {
      const elements = this.#registry[evt]

      if (elements.has(element)) {
        elements.delete(element)
      }

      if (elements.size === 0) {
        this.#remove(evt)
      }
    })
  }
}

export default new DOMEventRegistry(window)
