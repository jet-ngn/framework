import ParsedNode from '../parser/ParsedNode.js'
import ReferenceElement from './ReferenceElement.js'
import ReferenceCollection from './ReferenceCollection.js'
import ReferenceList from './ReferenceList.js'
import Constants from '../Constants.js'

export default class ReferenceManager {
  #context
  #root
  #selectors = {}
  #nodes = {}
  #references = {}

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
      default:
        const collection = new ReferenceCollection(this.#context)
        ;[...elements].map((element, index) => collection.add(element))
        return collection
    }
  }

  #registerReference = (name, ref, manager) => {
    const newRef = this.createReference(name, ref, manager)

    this.#references[name] = newRef

    newRef.forEach(ref => {
      console.log(ref);
    })

    return ref
  }

  getReference (name, manager = null) {
    if (name === 'root') {
      return this.#root
    }

    const ref = this.#references[name]

    if (ref) {
      if (!this.#selectors.hasOwnProperty(name)) {
        return ref  
      }

      const newRef = this.createReference(name, this.#selectors[name], manager)
      return ref.element === newRef.element ? ref : newRef
    }

    if (this.#selectors.hasOwnProperty(name)) {
      return this.#registerReference(name, this.#selectors[name], manager)
    }

    if (this.#nodes.hasOwnProperty(name)) {
      return this.#registerReference(name, this.#nodes[name], manager)
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

  #getElements = selector => ((this.#context.type === 'custom-element' ? this.#context.shadowRoot : this.#root) ?? document).querySelectorAll(selector)

  #validateReference = (name, node) => {
    if (Constants.REF_RESERVEDNAMES.includes(name)) {
      throw new Error(`Invalid reference: "${name}" is a reserved word`)
    }

    if (!(node instanceof ParsedNode) && typeof node !== 'string') {
      throw new Error(`Invalid reference "${name}". Expected a ParsedNode or a selector string but received ${NGN.typeof(node)}`)
    }
  }
}
