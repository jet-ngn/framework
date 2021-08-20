import Interpolation from './Interpolation.js'

export default class MultipleChildInterpolation extends Interpolation {
  remove () {
    if (!this.rendered) {
      console.log(this);
    }

    for (let i = this.rendered.length - 1; i >= 0; i--) {
      this.rendered[i].remove()
    }

    this.rendered = []
  }

  replaceWith (update) {
    for (let i = this.rendered.length - 1; i >= 1; i--) {
      this.rendered[i].remove()
      this.rendered.pop()
    }

    if (Array.isArray(update)) {
      const fragment = document.createDocumentFragment()
      fragment.append(...update)
      return this.rendered[0].replaceWith(fragment)
    }

    this.rendered[0].replaceWith(update)
  }
}
