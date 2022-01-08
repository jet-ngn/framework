import NGN from 'NGN'
import JetNode from './JetNode.js'
import Renderer from '../src-OLD/renderer/Renderer'
import Template from '../src-OLD/renderer/Template'
// import { BrowserEventRegistry } from '../src-OLD/registries/BrowserEventRegistry.js'
// import BrowserEventListener from './BrowserEventListener.js'
// import BrowserEventManager from './BrowserEventManager.js'

export default class JetElementNode extends JetNode {
  addEventListener () {
    return this.on(...arguments)
  }

  removeEventListener () {
    return this.off(...arguments)
  }

  once () {
    
  }

  on (event, callback, options) {
    const listener = BrowserEventManager.add(this, ...arguments)
    this.#eventListeners.push(listener.id)
    return listener
  }

  off (event, callback, options) {
    switch (typeof event) {
      case 'symbol': return BrowserEventManager.removeById(event)
      case 'string': return event === 'all' ? BrowserEventManager.removeByElement(this) : BrowserEventManager.removeByEvent(this, event, callback)
      default: throw new TypeError(`off() method: Invalid arguments. Expected "symbol" or "string," received "${typeof event}"`)
    }
  }
}