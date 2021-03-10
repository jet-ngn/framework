import Interpolation from './Interpolation.js'
import HTMLParser from '../parser/HTMLParser.js'
import Renderer from '../renderer/Renderer.js'
import Template from '../renderer/Template.js'

export default class DataInterpolation extends Interpolation {
  #field
  #value
  #template = null

  constructor (context, { field, initialValue, bindInterpolation }, index, retainFormatting) {
    super(...arguments)
    this.#field = field
    this.#value = initialValue

    bindInterpolation(this, context instanceof HTMLElement)
  }

  reconcile (update) {
    console.log('REC DATA INTERP')
  }

  render () {
    if (NGN.typeof(this.#value) === 'object') {
      return this.#renderObject()
    }

    this.rendered = document.createTextNode(this.#value)
    return this.rendered
  }

  update (value) {
    if (NGN.typeof(this.#value) === 'object') {
      return this.#updateObject(value)
    }

    if (`${value}` === this.rendered.data) {
      return
    }

    this.rendered.data = value
  }

  #renderObject = () => {
    const fragment = document.createDocumentFragment()
    this.#template = new Template(this.context, this.#value, this.retainFormatting)
    this.rendered = Renderer.appendNodes(fragment, this.#template)
    return this.rendered
  }

  #updateObject = value => {
    this.#template = this.#template.reconcile(new Template(this.context, value, this.retainFormatting))
  }
}
