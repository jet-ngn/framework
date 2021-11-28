import Constants from '../Constants.js'
import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Renderer from '../renderer/Renderer.js'
import Template from '../renderer/Template.js'
import ArrayReconciler from '../reconciler/ArrayReconciler.js'

export default class ArrayInterpolation extends MultipleChildInterpolation {
  #reconciler
  placeholder
  #lastNode = null

  constructor (context, interpolation, retainFormatting) {
    super(
      context,
      interpolation.map(item => new Template(context, item, retainFormatting)),
      retainFormatting
    )

    this.placeholder = document.createComment(this.id)
  }

  get type () {
    return Constants.INTERPOLATION_ARRAY
  }

  reconcile (update) {
    if (!this.#reconciler) {
      this.#reconciler = new ArrayReconciler(this)
    }

    this.#reconciler.reconcile(update)
  }

  render () {
    const fragment = document.createDocumentFragment()
    const { length } = this.value

    if (length > 0) {
      for (let i = 0; i < length; i++) {
        let item = this.value[i]

        if (item instanceof Template) {
          Renderer.appendNodes(fragment, item)
          continue
        }

        fragment.append(item.render())
      }
    } else {
      fragment.append(document.createComment(this.id))
    }

    return fragment
  }
}
