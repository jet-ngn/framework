import Interpolation from './Interpolation.js'
import Renderer from '../renderer/Renderer.js'
import Template from '../renderer/Template.js'

export default class PartialInterpolation extends Interpolation {
  #partial
  #template
  #placeholder

  constructor (context, { config, constructor, renderFn }, index, retainFormatting) {
    super(...arguments)

    this.#partial = new constructor(context, config)
    this.#template = new Template(context, renderFn.call(this.#partial), retainFormatting)
    this.#placeholder = document.createComment(this.id)
  }

  get partial () {
    return this.#partial
  }

  get template () {
    return this.#template
  }

  get type () {
    return 'partial'
  }

  insertAfter (fragment) {
    const { lastNode } = this.#template
    lastNode.parentNode.insertBefore(fragment, lastNode.nextSibling)
  }

  render () {
    return Renderer.appendNodes(document.createDocumentFragment(), this.#template)
  }

  reconcile (update) {
    this.#template.reconcile(update.template)
  }

  remove (usePlaceholder = true) {
    const { nodes } = this.#template

    for (let i = nodes.length - 1; i > 0; i--) {
      nodes[i].remove()
    }

    if (!usePlaceholder) {
      return nodes[0].remove()
    }

    nodes[0].replaceWith(this.#placeholder)
  }

  replaceWith (update) {
    const { nodes } = this.#template

    for (let i = nodes.length - 1; i > 0; i--) {
      nodes[i].remove()
    }

    nodes[0].replaceWith(...(Array.isArray(update) ? update : [update]))
  }
}
