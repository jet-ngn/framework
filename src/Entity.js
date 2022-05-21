import TreeNode from './TreeNode'
import DataSet from './DataSet'
import EventRegistry from './registries/EventRegistry'
import Bus from './Bus'
import { INTERNAL_ACCESS_KEY } from './env'

export default class Entity extends TreeNode {
  #data
  #description
  #name
  #scope
  #version

  constructor (parent, rootNode, { data, description, name, on, scope, version }, idPrefix) {
    super(parent, rootNode, idPrefix)

    this.#data = new DataSet(data ?? {})
    this.#description = description ?? null
    this.#name = name ?? `${rootNode.tagName.toLowerCase()}::${this.id}${version ? `@${version}` : ''}`
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null

    Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
  }

  get data () {
    return this.#data
  }

  get description () {
    return this.#description
  }

  get name () {
    return this.#name
  }

  get scope () {
    return this.#scope
  }

  get version () {
    return this.#version
  }

  emit (evt, ...args) {
    let key = null

    if (typeof evt === 'symbol') {
      key = evt
      evt = args[0]
      args = args.slice(1)
    }

    if (!!EventRegistry.reservedNames.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    Bus.emit(`${this.scope}.${evt}`, ...args)
  }

  find (selector) {
    selector = selector.trim()
    return [...this.root.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`)]
  }
}

// export default class Entity extends TreeNode {
//   #data
//   #description
//   #name
//   #scope
//   #version

//   constructor (parent, rootNode, { data, description, name, on, scope, version }, idPrefix) {
//     super(parent, rootNode, idPrefix)

//     this.#data = new DataSet(data ?? {})
//     this.#description = description ?? null
//     this.#name = name ?? `${rootNode.tagName.toLowerCase()}::${this.id}${version ? `@${version}` : ''}`
//     this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
//     this.#version = version ?? null

//     Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
//   }

//   get data () {
//     return this.#data
//   }

//   get description () {
//     return this.#description
//   }

//   get name () {
//     return this.#name
//   }

//   get scope () {
//     return this.#scope
//   }

//   get version () {
//     return this.#version
//   }

//   emit (evt, ...args) {
//     let key = null

//     if (typeof evt === 'symbol') {
//       key = evt
//       evt = args[0]
//       args = args.slice(1)
//     }

//     if (!!EventRegistry.reservedNames.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
//       throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
//     }

//     Bus.emit(`${this.scope}.${evt}`, ...args)
//   }

//   find (selector) {
//     selector = selector.trim()
//     return [...this.root.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`)]
//   }
// }