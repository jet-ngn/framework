import Interpolation from './Interpolation.js'

export default class DataInterpolation extends Interpolation {
  #field
  #value
  // #bindFn

  constructor (context, { field, initialValue, bindInterpolation }, index, retainFormatting) {
    super(...arguments)
    this.#field = field
    this.#value = initialValue
    // this.#bindFn = bindInterpolation

    bindInterpolation(this, context instanceof HTMLElement)
  }

  // bindData () {
  //   this.#bindFn(this)
  // }

  reconcile (update) {
    console.log('REC DATA INTERP')
  }

  render () {
    this.rendered = document.createTextNode(this.#value)
    return this.rendered
  }

  update (value) {
    if (`${value}` === this.rendered.data) {
      return
    }

    this.rendered.data = value
  }
}
