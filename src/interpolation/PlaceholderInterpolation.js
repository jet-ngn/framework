import Constants from '../Constants.js'
import Interpolation from './Interpolation.js'

export default class PlaceholderInterpolation extends Interpolation {
  get type () {
    return Constants.INTERPOLATION_PLACEHOLDER
  }

  reconcile (update) {
    let { data } = update.render()

    if (data !== this.rendered.data) {
      this.rendered.data = data
    }

    update.rendered = this.rendered
  }

  render () {
    this.rendered = document.createComment(this.id)
    return this.rendered
  }
}
