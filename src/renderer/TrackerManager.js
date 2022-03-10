import { typeOf } from '@ngnjs/libdata'
import { reconcileNodes } from './Renderer.js'
import Interpolation from './Interpolation.js'
import { sanitizeString } from '../utilities/StringUtils.js'

export function attachTrackerManager (obj) {
  Object.assign(obj.prototype, {
    track (target, property, transform = null) {
      return {
        type: 'tracker',
        target,
        property,
        transform
      }
    }
  })

  return obj
}

class Tracker extends Interpolation {
  nodes

  constructor ({ target, property, transform }, { retainFormatting }) {
    super()

    if (!property || typeof property === 'function') {
      throw new Error(`Invalid Tracker configuration. Expected a property name, recieved "${typeof property}"`)
    }

    this.target = target
    this.property = property
    this.initialValue = target[property]
    this.transform = transform
    this.retainFormatting = retainFormatting
  }

  get value () {
    const value = this.target[this.property]
    return this.transform ? this.transform(value) : value
  }
  
  update (cb) {
    this.nodes.forEach(cb)
  }
}

class StringTracker extends Tracker {
  get type () {
    return 'string'
  }

  generateNodes () {
    this.nodes = [this.#generateNode()]
    return this.nodes
  }

  update () {
    super.update(node => node.data = node.data === this.value ? node.data : this.value)
  }

  #generateNode () {
    // TODO: Handle transforms that produce tags or other output

    return document.createTextNode(this.value)
  }
}

class ArrayTracker extends Tracker {
  get type () {
    return 'array'
  }

  generateNodes () {
    this.nodes = this.value.map(item => this.#generateNode(item))
    return this.nodes
  }

  update (action, ...args) {
    switch (action) {
      case 'copyWithin': return this.#copyWithin(...args)
      case 'fill': return this.#fill(...args)
      case 'pop': return this.#pop(...args)
      case 'push': return this.#push(...args)
      case 'reverse': return this.#reverse(...args)
      case 'shift': return this.#shift(...args)
      case 'sort': return this.#sort(...args)
      case 'splice': return this.#splice(...args)
      case 'unshift': return this.#unshift(...args)
    
      default: throw new Error(`Array method "${action}" is not currently supported by Array Trackers`)
    }
  }

  #generateNode (item) {
    // TODO: Check for tags and render those

    return document.createTextNode(sanitizeString(item, this.retainFormatting))
  }

  #copyWithin (index, start, end = this.nodes.length) {
    let count = 0
    let nodesToCopy = [...this.nodes].slice(start, end).map(node => node.cloneNode(true))

    for (let i = index, length = (end - start) + index; i < length; i++) {
      const nodeToReplace = this.nodes[i]

      if (!nodeToReplace) {
        throw new ReferenceError(`Cannot copy within tracked array. No node exists at index "${index}"`)
      }

      reconcileNodes(nodeToReplace, nodesToCopy[count])
      count++
    }
  }

  #fill (update, start = 0, end = this.nodes.length) {
    for (let i = start; i < end; i++) {
      const existingNode = this.nodes[i]

      if (!existingNode) {
        throw new Error(`Invalid array fill parameters. No node exists at index "${i}"`)
      }

      reconcileNodes(existingNode, this.#generateNode(update))
    }
  }

  #pop () {
    this.nodes.at(-1).remove()
    this.nodes.pop()
  }

  #push (update) {
    const node = this.#generateNode(update)
    this.nodes.at(-1).after(node)
    this.nodes.push(node)
  }

  #reverse () {
    const reversed = [...this.nodes].reverse().map(node => node.cloneNode(true))
    
    for (let i = 0, { length } = this.nodes; i < length; i++) {
      reconcileNodes(this.nodes[i], reversed[i])
    }
  }

  #shift () {
    this.nodes[0].remove()
    this.nodes.shift()
  }

  #sort () {
    console.log('sort')
  }

  #splice (index, removeCount = 0, ...replacements) {
    let count = 0
    
    const newNodes = [...this.nodes]
    newNodes.splice(index, removeCount + index)

    for (let i = index, length = removeCount > 0 ? removeCount + index : this.nodes.length; i < length; i++) {
      const existingNode = this.nodes[i]
      const replacement = replacements[count]
      
      if (replacement) {
        const newNode = this.#generateNode(replacement)
        reconcileNodes(existingNode, newNode)
        newNodes.unshift(newNode)
      } else {
        existingNode.remove()
      }

      count++
    }

    this.nodes = newNodes
  }

  #unshift (update) {
    const node = this.#generateNode(update)
    this.nodes.at(0).before(node)
    this.nodes.unshift(node)
  }
}

export class TrackerRegistry {
  #context
  #targets = new Map
  #trackers = {}

  constructor (context) {
    this.#context = context
  }

  generateNodes (id) {
    const tracker = this.#trackers[id]

    if (!tracker) {
      throw new ReferenceError(`Tracker "${id}" not found`)
    }

    return tracker.generateNodes()
  }

  #trackString (tracker, registeredTarget) {
    const { target, property, initialValue, retainFormatting } = tracker
    let value = initialValue

    delete target[property]

    Object.defineProperty(target, property, {
      get: () => sanitizeString(value, { retainFormatting }),

      set: val => {
        value = val
        registeredTarget[property].forEach(tracker => tracker.update())
      }
    })
  }

  #trackArray (tracker, registeredTarget) {
    let { target, property } = tracker
    
    target[property] = new Proxy(target[property], {
      get: (target, property) => {
        const original = target[property]

        switch (property) {
          case 'copyWithin':
          case 'fill':
          case 'pop':
          case 'push':
          case 'reverse':
          case 'shift':
          case 'sort':
          case 'splice':
          case 'unshift': return (...args) => {
            original.apply(target, args)
            registeredTarget[tracker.property].forEach(tracker => tracker.update(property, ...args))
          }
        
          default: return original
        }
      }
    })
  }

  #makeTracker ({ target, property }, cfg) {
    const type = typeOf(target[property])

    switch (type) {
      case 'string':
      case 'number': return new StringTracker(arguments[0], cfg)

      case 'array': return new ArrayTracker(arguments[0], cfg)
    
      default: throw new TypeError(`Invalid tracked property type "${type}"`)
    }
  }

  #track (tracker, registeredTarget) {
    switch (tracker.constructor.name) {
      case 'StringTracker': return this.#trackString(...arguments)
      case 'ArrayTracker': return this.#trackArray(...arguments)
      // case 'DataFieldTracker': return this.#trackDataField(...arguments)
      // case 'DataStoreTracker': return this.#trackDataStore(...arguments)
    
      default: return
    }
  }

  register ({ target, property }, cfg) {
    let registeredTarget = this.#targets.get(target)
    const tracker = this.#makeTracker(...arguments)
    this.#trackers[tracker.id] = tracker

    if (!registeredTarget) {
      this.#targets.set(target, {
        [property]: [tracker]
      })

      this.#track(tracker, this.#targets.get(target))

    } else if (registeredTarget.hasOwnProperty(property)) {
      registeredTarget[property].push(tracker)
    } else {
      registeredTarget[property] = [tracker]
      this.#track(tracker, registeredTarget)
    }

    return tracker
  }

  get hasTrackers () {
    return this.#targets.size > 0
  }

  get (id) {
    return this.#targets[id]
  }
}