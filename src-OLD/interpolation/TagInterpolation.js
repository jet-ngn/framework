import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Constants from '../Constants.js'
import Renderer from '../renderer/Renderer.js'

export default class TagInterpolation extends MultipleChildInterpolation {
  get type () {
    return Constants.INTERPOLATION_TAG
  }

  reconcile (update) {
    if (update.value.nodes.length !== this.value.nodes.length) {
      return this.replaceWith(update.render())
    }

    this.value.reconcile(update.value)
    update.rendered = this.rendered
  }

  render () {
    const fragment = document.createDocumentFragment()
    this.rendered = [...Renderer.appendNodes(fragment, this.value).childNodes]
    return fragment
  }
}