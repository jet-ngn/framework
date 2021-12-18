import NGN from 'NGN'
import DOMEventListener from "./DOMEventListener"

class DOMEventManager {
  #root
  #listeners = new Map

  constructor (root) {
    this.#root = root

    NGN.LEDGER.on(NGN.INTERNAL_EVENT, function (evt, ...rest) {
      switch (evt) {
        // case 'Element.remove': return this.remove(id)
        // case 'DOMEventHandler.remove': return this.remove(id)
        default: break
      }
    })
  }

  add (element, event, callback, options) {
    const applyListeners = !this.#hasEvent(event)
    const listener = new DOMEventListener(element, event, callback, options)

    this.#listeners.set({
      event,
      id: listener.id,
      element,
      handler: listener.handler.id
    }, listener)

    applyListeners && this.#applyListeners(event)
    NGN.INTERNAL('DOMEventListener.added', listener)

    return listener
  }

  removeByElement (element) {
    console.log('REMOVE LISTENERS FROM', element)
  }

  // NGN.INTERNAL('DOMEventListener.remove', event, callback, options)

  removeByEvent (element, event, callback) {
    console.log('REMOVE', event, 'from', element)
    
    if (callback) {
      console.log('CALLBACK', callback)
    }
  }

  removeById (id) {
    console.log('REMOVE', id)
  }

  #applyListeners = eventName => this.#root.addEventListener(eventName, evt => {
    [...this.#listeners.values()]
      .filter(({ event }) => event === eventName)
      .forEach(({ handler }) => handler.call(evt))
  })

  #hasEvent = name => [...this.#listeners.keys()].some(({ event }) => event === name)
}

export default new DOMEventManager(window)

// export default class DOMEventManager {
//   #context
//   #listeners = new Map

//   constructor (element) {
//     this.#context = element
//   }

//   add (evt, handler, options) {
//     const listener = new DOMEventListener(evt, handler, options)

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