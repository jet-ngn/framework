import Tag from '../tag/Tag.js'
import Renderer from './Renderer.js'
import HTMLParser from '../parser/HTMLParser.js'
import InterpolationManager from '../interpolation/InterpolationManager.js'
import PerformanceMonitor from '../diagnostics/PerformanceMonitor.js'
import ElementNode from '../parser/ElementNode.js'

export default class Template {
  #context
  #tag
  #nodes
  #html
  #interpolationManager
  #retainFormatting

  constructor (context, tag, retainFormatting) {
    this.#context = context

    if (!(tag instanceof Tag)) {
      throw new TypeError(`Invalid template: expected "Tag", received "${NGN.typeof(tag)}"`)
    }

    this.#tag = tag
    this.#interpolationManager = new InterpolationManager(this)
    this.#retainFormatting = retainFormatting ?? context.retainFormatting
    
    const { html, nodes } = HTMLParser.parse(this)

    this.#html = html
    this.#nodes = nodes
  }

  get context () {
    return this.#context
  }

  get html () {
    return this.#html
  }

  get interpolationManager () {
    return this.#interpolationManager
  }

  get lastNode () {
    return this.#nodes[this.#nodes.length - 1]
  }

  get nodes () {
    return this.#nodes
  }

  get retainFormatting () {
    return this.#retainFormatting
  }

  get tag () {
    return this.#tag
  }

  append ({ nodes, interpolationManager }) {
    for (let i = 0, length = nodes.length; i < length; i++) {
      const node = nodes[i]
      this.lastNode.parentNode.insertBefore(node.render(), this.lastNode.nextSibling)
      this.#nodes.push(node)
    }

    const { interpolations } = interpolationManager

    Object.keys(interpolations).forEach(interpolation => {
      this.interpolationManager.appendInterpolation(interpolations[interpolation])
    })

    return this
  }

  reconcile (update) {
    for (let i = 0, length = update.nodes.length; i < length; i++) {
      const node = update.nodes[i]

      if (node.constructor !== this.nodes[i].constructor) {
        this.nodes[i].replaceWith(node.render())
        continue
      }

      this.nodes[i].reconcile(node)
    }

    return update
  }

  toString () {
    const div = document.createElement('div')
    div.append(...this.#nodes.map(node => node.render()))
    return div.innerHTML
  }
}
