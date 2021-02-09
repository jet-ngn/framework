import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Renderer from '../renderer/Renderer.js'

export default class TagInterpolation extends MultipleChildInterpolation {
  get type () {
    return 'tag'
  }

  reconcile (update) {
    update.render()

    if (update.rendered.length !== this.rendered.length) {
      return this.replaceWith(update.render())
    }

    this.value.reconcile(update.value)
    update.rendered = this.rendered
  }

  render () {
    const fragment = document.createDocumentFragment()
    console.log(this.value);
    this.rendered = [...Renderer.appendNodes(fragment, this.value).childNodes]
    return fragment
  }
}
