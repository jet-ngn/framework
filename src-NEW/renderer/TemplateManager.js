import Template from './Template.js'
import Interpolation from '../interpolation/Interpolation.js'
import ElementNode from '../parser/ElementNode.js'

import PerformanceMonitor from '../diagnostics/PerformanceMonitor.js'

// const Perf = new PerformanceMonitor
// Perf.enable()

export default class TemplateManager {
  #context
  #initialized = false
  #template
  #nodes = []
  #history = []
  #retainFormatting

  constructor (context, retainFormatting) {
    this.#context = context
    this.#retainFormatting = retainFormatting ?? false
  }

  get template () {
    return this.#template
  }

  // get history () {
  //   return this.#history
  // }

  get initialized () {
    return this.#initialized
  }

  get nodes () {
    return this.#template.nodes
  }

  get refs () {
    return this.#template.refs
  }

  #generateTemplate = tag => new Template(this.#context, tag, this.#retainFormatting)

  initialize (tag) {
    this.#template = this.#generateTemplate(tag)
    this.#initialized = true
    return this.#template
  }

  append (tag) {
    const template = this.#generateTemplate(tag)
    return this.#template.append(template)
  }

  reconcile (tag) {
    const template = this.#generateTemplate(tag)
    // this.#history.push(this.#template)
    this.#template = this.#template.reconcile(template, this.#context.target)

    return this.#template
  }
}
