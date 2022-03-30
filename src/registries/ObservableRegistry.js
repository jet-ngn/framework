import Template from '../Template.js'
import { NANOID } from '@ngnjs/libdata'
import { reconcileNodes } from '../Reconciler.js'
import { sanitizeString } from '../utilities/StringUtils.js'
import Renderer from '../Renderer.js'

const observables = new Map

export class Tracker {
  #id = NANOID()
  #target
  #property
  #transform
  #parent
  #nodes
  #placeholder
  #options

  constructor (target, property, transform) {
    this.#target = target
    this.#property = property ?? null
    this.#transform = transform ?? (value => value)
  }

  get id () {
    return this.#id
  }

  get output () {
    return this.#transform(this.#target[this.#property])
  }

  render (parent, node, options) {
    this.#parent = parent
    this.#placeholder = node
    this.#nodes = [node]
    this.#options = options
    this.update()
  }

  pop () {
    this.#nodes.at(-1).remove()
    this.#nodes.pop()
  }

  push (...args) {
    const nodes = args.map(arg => this.#getNodes(arg))
    const last = this.#nodes.at(-1)
  
    if (last === this.#placeholder) {
      last.replaceWith(...nodes)
      this.#nodes = nodes
    } else {
      last.after(...nodes)
      this.#nodes.push(...nodes)
    }
  }

  reconcile () {
    reconcileNodes(this.#nodes, this.output.map(node => this.#getNodes(node)))
  }

  shift () {
    this.#nodes[0].remove()
    this.#nodes.shift()
  }

  unshift (...args) {
    const nodes = args.map(arg => this.#getNodes(arg))
    this.#nodes.at(0).before(...nodes)
    this.#nodes.unshift(...nodes)
  }

  update () {
    const { output } = this

    if (!this.#property) {
      return console.log('HANDLE FULL OBJECT PROXY')
    }

    if (Array.isArray(output)) {
      this.#nodes = reconcileNodes(this.#nodes, output.map(item => this.#getNodes(item)))
      return
    }

    if (output instanceof Template) {
      this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(output))
      return 
    }

    switch (typeof output) {
      case 'string':
      case 'number': 
        this.#nodes = reconcileNodes(this.#nodes, [this.#getNodes(output)])
        break
      
      default: throw new TypeError(`Unsupported tracked content type "${typeof output}"`)
    }
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      return console.log('HANDLE NESTED ARRAY')
    }

    if (value instanceof Template) {
      return [...Renderer.render(this.#parent, output, this.#options).childNodes]
    }

    switch (typeof value) {
      case 'string':
      case 'number': return document.createTextNode(sanitizeString(`${value}`, this.#options))
    
      default: return console.log('HANDLE ', typeof value)
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
      get: (target, property, ...rest) => {
        const value = target[property]

        if (Array.isArray(value)) {
          return this.#makeArrayProxy(target, property)
        }

        return value
      },

      set: (target, property, value) => {
        target[property] = value
        const { trackers } = this.getTarget(target) ?? {}

        for (let tracker of trackers) {
          tracker.update()
        }

        return true
      }
    })

    observables.set(target, { revocable, trackers: [] })
    return revocable.proxy
  }

  static #makeArrayProxy (parent, name) {
    return new Proxy(parent[name], {
      get: (target, property) => {
        const original = target[property]
        const { trackers } = this.getTarget(parent) ?? {}
        
        const callback = (reconcile = false) => (...args) => {
          original.apply(target, args)

          for (let tracker of trackers) {
            reconcile ? tracker.reconcile() : tracker[property](...args)
          }
        }

        switch (property) {
          case 'pop':
          case 'push':
          case 'shift':
          case 'unshift': return callback()

          case 'copyWithin':
          case 'fill':
          case 'reverse':
          case 'sort':
          case 'splice': return callback(true)
        
          default: return original
        }
      }
    })
  }
}