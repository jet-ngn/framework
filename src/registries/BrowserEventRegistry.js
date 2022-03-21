import NGN from 'NGN'
import EventHandler from '../EventHandler.js'

class BrowserEventHandler extends EventHandler {
  constructor (context, event, callback, cfg) {
    if (cfg?.once) {
      cfg.max = 1
      delete cfg.once
    }

    super(...arguments, 'BrowserEventHandler')
  }
}

class BrowserEventListener {
  #context
  #node
  #event
  #handler
  #options
  #abortController = null
  #id = Symbol('BrowserEventListener')

  constructor (context, node, event, callback, options = null) {
    this.#context = context
    this.#node = node
    this.#event = event
    this.#handler = new BrowserEventHandler(context, event, callback, options)
    this.#options = this.#processOptions(options)

    if (!this.#options.hasOwnProperty('signal')) {
      this.#abortController = new AbortController
      this.#options.signal = this.#abortController.signal
    }
  }

  #processOptions = options => {
    if (options === null) {
      return {}
    }

    switch (typeof options) {
      case 'object': return options
      case 'boolean': return { capture: options } 
      default: throw new TypeError(`Invalid Event Listener options. Expected "object" or "boolean" but received "${typeof options}"`)
    }
  }

  get node () {
    return this.#node
  }

  get event () {
    return this.#event
  }

  get id () {
    return this.#id
  }

  get handler () {
    return this.#handler
  }

  get options () {
    return this.#options
  }

  abort () {
    this.#abortController.abort()
  }
}

class BrowserEventRegistry {
  #root
  #listeners = new Map

  constructor (root) {
    this.#root = root

    // NGN.LEDGER.on(NGN.INTERNAL_EVENT, function (evt, ...rest) {
    //   switch (evt) {
    //     // case 'Element.remove': return this.remove(id)
    //     // case 'DOMEventHandler.remove': return this.remove(id)
    //     default: break
    //   }
    // })
  }

  add (entity, node, event, callback, options) {
    const applyListeners = !this.#hasEvent(event)
    const listener = new BrowserEventListener(entity, node, event, callback, options)

    this.#listeners.set({
      entity,
      event,
      id: listener.id,
      node,
      handler: listener.handler.id
    }, listener)

    applyListeners && this.#applyListeners(event)
    // NGN.INTERNAL('BrowserEventListener.added', listener)

    return listener
  }

  removeByEntity (entity) {
    [...this.#listeners.keys()].filter(listener => listener.entity === entity).forEach(listener => this.#listeners.delete(listener))
  }

  removeByNode (node) {
    console.log('REMOVE LISTENERS FROM', node)
  }

  // NGN.INTERNAL('BrowserEventListener.remove', event, callback, options)

  removeByEvent (node, event, callback) {
    console.log('REMOVE', event, 'from', node)
    
    if (callback) {
      console.log('CALLBACK', callback)
    }
  }

  removeById (id) {
    console.log('REMOVE', id)
  }

  #applyListeners (eventName) {
    return this.#root.addEventListener(eventName, evt => {
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

export default new BrowserEventRegistry(window)

// export default class DOMEventManager {
//   #context
//   #listeners = new Map

//   constructor (element) {
//     this.#context = element
//   }

//   add (evt, handler, options) {
//     const listener = new BrowserEventListener(evt, handler, options)

//     listener.options.signal.onabort = evt => this.#listeners.delete(listener.id)
//     this.#listeners.set(listener.id, listener)
//     // TODO: Register this event in the DOMEventManager
//     this.#context.addEventListener(listener.event, listener.handler, listener.options)

//     return listener
//   }

//   remove (evt, handler) {
//     switch (typeof evt) {
//       case 'symbol': return this.#removeListenerById(evt)
//       case 'string': return handler ? this.#removeListener(evt, handler) : this.#removeListeners(evt)
//       default: throw new TypeError(`Expected "symbol" or "string," received "${typeof evt}"`)
//     }
//   }

//   #removeListener = (evt, handler) => {
//     const listener = [...this.#listeners.values()].find(listener => listener.handler === handler)
    
//     if (!listener) {
//       throw new ReferenceError(`No listener with the specified handler could be found.`)
//     }

//     listener.abort()
//   }

//   #removeListenerById = id => {
//     const listener = this.#listeners.get(id)

//     if (!listener) {
//       throw new ReferenceError(`Listener not found.`)
//     }

//     listener.abort()
//   }

//   #removeListeners = evt => {
//     let removed = false

//     for (let [id, listener] of this.#listeners) {
//       if (listener.event === evt) {
//         listener.abort()
//         removed = true
//       }
//     }

//     if (!removed) {
//       throw new ReferenceError(`No listeners for "${evt}" event are registered.`)
//     }
//   }
// }