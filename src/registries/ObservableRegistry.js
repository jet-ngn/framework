import Template from '../Template.js'
import { NANOID } from '@ngnjs/libdata'
import { reconcileNodes } from '../Reconciler.js'
import { sanitizeString } from '../utilities/StringUtils.js'

const observables = new Map

export class Tracker {
  #id = NANOID()
  #target
  #property
  #transform
  #rendered = false
  #nodes

  constructor (target, property, transform) {
    this.#target = target
    this.#property = property ?? null
    this.#transform = transform ?? null
  }

  get id () {
    return this.#id
  }

  render (node, { retainFormatting }) {
    if (this.#rendered) {
      throw new Error(`Tracker ${this.id} has already been rendered`)
    }

    if (!this.#property) {
      return console.log('HANDLE FULL OBJECT PROXY')
    }

    const value = this.#target[this.#property]

    if (Array.isArray(value)) {
      return console.log('RENDER PLAIN ARRAY')
    }

    if (value instanceof Template) {
      return console.log('RENDER TEMPLATE')
    }

    switch (typeof value) {
      case 'string':
      case 'number': 
        this.#nodes = reconcileNodes([node], [document.createTextNode(sanitizeString(value, retainFormatting))])
        break
    
      default: throw new TypeError(`Unsupported tracked value type "${typeof value}"`)
    }
  }
}

export default class ObservableRegistry {
  static track (target, property, transform) {
    const tracker = new Tracker(target, property, transform)
    const observable = this.getProxy(target)
    
    if (!observable) {
      throw new Error(`Cannot track unobserved object`)
    }

    observable.trackers.push(tracker)
    return tracker
  }

  static getTarget (target) {
    return observables.get(target)
  }

  static getProxy (proxy) {
    return [...observables.values()].find(({ revocable }) => revocable.proxy === proxy)
  }

  static has (target) {
    return [...observables.values()].some(({ proxy }) => proxy === target)
  }

  static register (target) {
    const revocable = Proxy.revocable(target, {
      get: (target, property) => target[property],
      set: (target, property, value) => console.log('SET', target, property, value)
    })

    observables.set(target, { revocable, trackers: [] })
    return revocable.proxy
  }
}