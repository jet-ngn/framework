import ReferenceElementProxy from './ReferenceElementProxy.js'
import Tag from '../tag/Tag.js'
import Renderer from '../renderer/Renderer.js'
import ParsedNode from '../parser/ParsedNode.js'
import DOMEventRegistry from '../registries/DOMEventRegistry.js'
import { createID } from '../Utilities.js'

export default class ReferenceElement extends ReferenceElementProxy {
  #context
  #name
  #renderer
  #managedNode

  constructor (context, name, element, collection) {
    let managedNode

    if (element instanceof ParsedNode) {
      managedNode = element
      element = element.source
    }

    super(element, collection)

    this.#context = context
    this.#name = name
    this.#managedNode = managedNode ?? null
  }

  get 0 () {
    return this
  }

  get length () {
    return 1
  }

  get retainFormatting () {
    return this.element.nodeName === 'PRE'
  }

  destroy () {
    this.offAll()
    
    if (!!this.collection) {
      this.collection.remove(this.#name)
    }

    this.element.remove()
  }

  find (selector) {
    return new ReferenceElement(this.#context, createID(), this.element.querySelector(selector))
  }

  forEach (cb) {
    return [this].forEach(cb)
  }

  on (evt, callback, cfg = {}) {
    DOMEventRegistry.register(this.#context, this, evt, callback, cfg)
  }

  off (evt, callback) {
    if (evt === 'all') {
      return this.offAll()
    }

    DOMEventRegistry.deregister(this, evt, callback)
  }

  offAll () {
    DOMEventRegistry.deregister(this, 'all')
  }

  // Alias
  allOff () {
    this.offAll()
  }

  append (tag) {
    if (!(tag instanceof Tag)) {
      return this.element.append(...arguments)
    }

    this.#render('append', tag)
  }

  removeChildElement (element) {
    if (!this.#renderer) {
      return element.remove()
    }

    this.#renderer.removeElement(element)
  }

  render (tag) {
    this.#render('render', tag)
  }

  replace (tag) {
    this.#render('replace', tag)
  }

  reset () {
    this.#renderer = new Renderer(this.#context, this.element)
  }

  #render = (type, tag) => {
    if (!this.#renderer) {
      this.#renderer = new Renderer(this.#context, this.element)
    }

    switch (type) {
      case 'append': return this.#renderer.append(tag)
      case 'render': return this.#renderer.render(tag)
      case 'replace':
        this.element.innerHTML = ''
        return this.#renderer.replace(tag)
    }
  }

  [Symbol.iterator] () {
    return {
      next: () => ({
        value: this,
        done: true
      })
    }
  }

  [Symbol.toStringTag] () {
    return 'ReferenceElement'
  }
}
