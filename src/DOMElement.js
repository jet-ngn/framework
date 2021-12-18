import NGN from 'NGN'
import { DOMEventRegistry } from '../src-OLD/registries/DOMEventRegistry.js'
import DOMEventListener from './DOMEventListener.js'
import DOMEventManager from './DOMEventManager.js'

export default class DOMElement {
  #source = null
  #revocable
  #eventListeners = []
  
  #getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

  constructor (element) {
    this.#source = element
    
    this.#revocable = Proxy.revocable(element, {
      get: (target, property) => this.#getValue(this, this[property]) ?? this.#getValue(target, target[property]),
      set: (target, property, value) => Reflect.set((property in target) ? target : this, property, value)
    })

    return this.#revocable.proxy
  }

  addEventListener () {
    return this.on(...arguments)
  }

  removeEventListener () {
    return this.off(...arguments)
  }

  remove () {
    NGN.INTERNAL(`${this.constructor.name}.remove`, this.#eventListeners)
    this.#revocable.revoke()
    this.#source.remove()
    NGN.INTERNAL(`${this.constructor.name}.removed`, this)
    this.#source = null
  }

  mergeChildren (DOM) {
    // const patch = {
    //   classList: this.classList
    // }
    // console.log(...arguments);
  }

  on (event, callback, options) {
    const listener = DOMEventManager.add(this, ...arguments)
    this.#eventListeners.push(listener.id)
    return listener
  }

  off (event, callback, options) {
    switch (typeof event) {
      case 'symbol': return DOMEventManager.removeById(event)
      case 'string': return event === 'all' ? DOMEventManager.removeByElement(this) : DOMEventManager.removeByEvent(this, event, callback)
      default: throw new TypeError(`off() method: Invalid arguments. Expected "symbol" or "string," received "${typeof event}"`)
    }
  }
}