// import NGN2 from '../../lib/ngn.min.js'
import Renderer from '../renderer/Renderer.js'
import ParsedNode from '../parser/ParsedNode.js'
import ReferenceElementProxy from './ReferenceElementProxy.js'
import ReferenceElement from './ReferenceElement.js'
import ReferenceCollection from './ReferenceCollection.js'
import ReferenceList from './ReferenceList.js'

export default class ReferenceManager {
  #context
  #root
  #selectors = {}
  #nodes = {}
  #references = {}
  #reservedNames = ['add', 'remove', 'root']
  // #applyContext = selector => `${this.#context.selector ? `${this.#context.selector} ` : ''}${selector}`

  constructor (context, selectors, root) {
    this.#context = context

    Object.keys(selectors).forEach(selector => this.#validateReference(name, selectors[selector]))

    this.#selectors = selectors

    const { element, selector } = root
    const source = element ?? selector ?? null

    if (!source) {
      throw new Error(`Invalid ${this.#context.type} "${this.#context.name}". "selector" property is required`)
    }

    this.#root = this.createReference('root', source)
  }

  get length () {
    return Object.keys(this.#selectors).length
  }

  get references () {
    return new ReferenceList(this.#context, this.#context.root, this.#selectors, this.#nodes)
  }

  addReference (name, node) {
    this.#validateReference(...arguments)

    if (typeof node === 'string') {
      this.#selectors[name] = node
      return
    }

    this.#nodes[name] = node
    return this.getReference(name, this.#context)
  }

  // addReferences (nodes) {
  //   return nodes.map(node => this.addReference(node.ref, node))
  // }

  clear () {
    this.#references = {}
  }

  createReference (name, node) {
    let elements = []

    if (typeof node === 'string') {
      elements = this.#getElements(node)
    }

    if (node instanceof ParsedNode) {
      elements = [node]
    }

    if (node instanceof HTMLElement) {
      elements = [node]
    }

    switch (elements.length) {
      case 0: return null
      case 1: return new ReferenceElement(this.#context, name, elements[0])
      default: return new ReferenceCollection([...elements].map((element, index) => new ReferenceElement(this.#context, index, element)))
    }
  }

  getReference (name, manager = null) {
    if (name === 'root') {
      return this.#root
    }

    if (this.#references.hasOwnProperty(name)) {
      const ref = this.#references[name]

      if (!this.#selectors.hasOwnProperty(name)) {
        return ref  
      }

      const newRef = this.createReference(name, this.#selectors[name], manager)
      return ref.element === newRef.element ? ref : newRef
    }

    if (this.#selectors.hasOwnProperty(name)) {
      this.#references[name] = this.createReference(name, this.#selectors[name], manager)
      return this.#references[name]
    }

    if (this.#nodes.hasOwnProperty(name)) {
      this.#references[name] = this.createReference(name, this.#nodes[name], manager)
      return this.#references[name]
    }

    console.error(`Reference "${name}" not found`)
    return null
  }

  hasReference (name) {
    return { ...this.#selectors, ...this.#nodes }.hasOwnProperty(name)
  }

  removeReference (name) {
    let ref
    let collection

    if (this.#selectors.hasOwnProperty(name)) {
      ref = this.#selectors[name]
      collection = this.#selectors
    }

    if (this.#nodes.hasOwnProperty(name)) {
      ref = this.#nodes[name]
      collection = this.#nodes
    }

    if (!ref) {
      return console.error(`Reference "${name}" not found.`)
    }

    delete collection[name]
  }

  #getElements = selector => {
    return selector.startsWith('#') ? document.getElementById(selector) : (this.#root ?? document).querySelectorAll(selector)
  }

  #validateReference = (name, node) => {
    if (this.#reservedNames.includes(name)) {
      throw new Error(`Invalid reference: "${name}" is a reserved word`)
    }

    if (!(node instanceof ParsedNode) && typeof node !== 'string') {
      throw new Error(`Invalid reference "${name}". Expected a ParsedNode or a selector string but received ${NGN.typeof(node)}`)
    }
  }
}

// registerHandler (element, type, evt, callback, threshold = 0) {
//   let obj = {
//     event: evt,
//     type,
//     callback
//   }
//
//   if (!this.handlers.has(element)) {
//     return this.handlers.set(element, [obj])
//   }
//
//   let handlers = this.handlers.get(element)
//
//   if (handlers.some(handler => handler.callback === callback)) {
//     return
//   }
//
//   handlers.push(obj)
// }

// resetHandlers () {
//   this.handlers.clear()
// }

// unregisterHandler (element, evt, callback) {
//   if (!this.handlers.has(element)) {
//     return console.error(`Reference element not found`)
//   }
//
//   let handlers = this.handlers.get(element).filter(handler => handler.callback !== callback)
//
//   if (handlers.length === 0) {
//     return this.handlers.delete(element)
//   }
//
//   this.handlers.set(element, handlers)
// }

// unregisterAllHandlers (element) {
//   this.handlers.delete(element)
// }
