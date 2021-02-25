import Interpolation from './Interpolation.js'

export default class TextInterpolation extends Interpolation {
  // #rendered

  get type () {
    return 'text'
  }

  // reconcile (update) {
  //   if (this.value === update.value) {
  //     return
  //   }
  //
  //   update = update.render()
  //   this.#rendered.replaceWith(update)
  //   this.#rendered = update
  // }

  // render () {
  //   this.#rendered = document.createTextNode(this.value)
  //   return this.#rendered
  // }
}
