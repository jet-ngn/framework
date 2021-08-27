import TemplateManager from './TemplateManager.js'
import Tag from '../tag/Tag.js'

export default class Renderer {
  #context
  #target = null
  #templateManager
  #retainFormatting

  #observer = new MutationObserver(mutations => {
    this.#context.emit('rendered')
    this.#observer.disconnect()
  })

  constructor (context, target) {
    this.#context = context
    this.#target = target

    if (!target) {
      throw new ReferenceError(`${context.type} "${context.name}:" Invalid target element`)
    }

    this.#retainFormatting = this.#target.nodeName === 'PRE'
    this.#templateManager = new TemplateManager(this.#context, this.#retainFormatting)
  }

  get context () {
    return this.#context
  }

  get retainFormatting () {
    return this.#retainFormatting
  }

  get target () {
    return this.#target
  }

  clear () {
    while (this.#target.lastChild) {
      this.#target.removeChild(this.#target.lastChild)
    }
  }

  static appendNodes (target, { nodes, interpolationManager }) {
    const queue = new NGN.Tasks
    const fragment = document.createDocumentFragment()

    for (let i = 0, length = nodes.length; i < length; i++) {
      fragment.append(nodes[i].render())
    }

    target.appendChild(fragment)
    return target
  }

  append (tag) {
    return this.#render('append', tag)
  }

  render (tag) {
    return this.#render('render', tag)
  }

  replace (tag) {
    this.clear()
    return this.#render('replace', tag)
  }

  #render = (type, tag) => {
    if (!(tag instanceof Tag)) {
      throw new TypeError(`${this.#context.type} ${this.#context.name}: : ${type}() expected tagged template literal, received "${NGN.typeof(tag)}"`)
    }

    this.#observer.observe(this.#target, { childList: true })
    
    if (!this.#templateManager.initialized) {
      return this.#renderInitial(tag)
    }

    switch (type) {
      case 'append': return this.#templateManager.append(tag)
      case 'render': return this.#templateManager.reconcile(tag)
      case 'replace': return this.#renderInitial(tag)
    }
  }

  #renderInitial = tag => {
    const template = this.#templateManager.initialize(tag)
    return Renderer.appendNodes(this.#target, template)
  }
}
