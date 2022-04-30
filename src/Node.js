import RouterRegistry from './RouterRegistry.js'

const getValue = (target, value) => value ? (typeof value === 'function' ? value.bind(target) : value) : null

export default class Node {
  #source = null
  #revocable

  constructor (node) {
    this.#source = node
    
    this.#revocable = Proxy.revocable(node, {
      get: (target, property) => getValue(this, this[property]) ?? getValue(target, target[property]),
      set: (target, property, value) => Reflect.set((property in target) ? target : this, property, value)
    })

    return this.#revocable.proxy
  }

  get length () {
    return 1
  }

  attachRouter (routes) {
    RouteRegistry.attachRouter(this, routes)
  }

  remove () {
    console.log('REMOVE');
    // NGN.INTERNAL(`${this.constructor.name}.remove`, this)
    this.#source.remove()
    // NGN.INTERNAL(`${this.constructor.name}.removed`, this)
  }

  revoke () {
    console.log('REVOKE PROXY')
  }

  // addEventListener () {
  //   return this.on(...arguments)
  // }

  // removeEventListener () {
  //   return this.off(...arguments)
  // }

  // on (event, callback, options) {
  //   const listener = BrowserEventManager.add(this, ...arguments)
  //   this.#eventListeners.push(listener.id)
  //   return listener
  // }

  // off (event, callback, options) {
  //   switch (typeof event) {
  //     case 'symbol': return BrowserEventManager.removeById(event)
  //     case 'string': return event === 'all' ? BrowserEventManager.removeByElement(this) : BrowserEventManager.removeByEvent(this, event, callback)
  //     default: throw new TypeError(`off() method: Invalid arguments. Expected "symbol" or "string," received "${typeof event}"`)
  //   }
  // }
}