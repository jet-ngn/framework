import TemplateManager from './TemplateManager.js'
import Tag from '../tag/Tag.js'
import JobRegistry from '../registries/JobRegistry.js'

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

  async append (tag) {
    return await this.#render('append', tag)
  }

  async render (tag) {
    return await this.#render('render', tag)
  }

  async replace (tag) {
    this.clear()
    return await this.#render('replace', tag)
  }

  #render = async (type, tag) => {
    if (!(tag instanceof Tag)) {
      throw new TypeError(`${this.#context.type} ${this.#context.name}: : ${type}() expected tagged template literal, received "${NGN.typeof(tag)}"`)
    }

    this.#observer.observe(this.#target, { childList: true })
    
    if (!this.#templateManager.initialized) {
      return await this.#renderInitial(tag)
    }

    const output = (async () => {
      switch (type) {
        case 'append': return this.#templateManager.append(tag)
        case 'render': return this.#templateManager.reconcile(tag)
        case 'replace': return await this.#renderInitial(tag)
      }
    })()

    await JobRegistry.runJobs()
    return output
  }

  #renderInitial = async (tag) => {
    const template = this.#templateManager.initialize(tag)
    const output = Renderer.appendNodes(this.#target, template)

    await JobRegistry.runJobs()
    return output
  }
}
