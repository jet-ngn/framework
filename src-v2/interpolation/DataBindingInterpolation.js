import Constants from '../Constants.js'
import Interpolation from './Interpolation.js'
import Renderer from '../renderer/Renderer.js'
import Template from '../renderer/Template.js'
import DataBindingRegistry from '../registries/DataBindingRegistry.js'

export default class DataBindingInterpolation extends Interpolation {
  #template = null
  #value

  constructor (context, { model, field, process }, retainFormatting) {
    super(...arguments)

    const value = model[field]
    this.#value = process ? process(value) : value

    DataBindingRegistry.registerInterpolationBinding({
      model,
      field,
      process,
      interpolation: this,
      defer: context instanceof HTMLElement
    })
  }

  get type () {
    return Constants.INTERPOLATION_DATABINDING
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