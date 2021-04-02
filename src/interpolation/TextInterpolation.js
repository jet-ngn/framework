import Constants from '../Constants.js'
import Interpolation from './Interpolation.js'

export default class TextInterpolation extends Interpolation {
  #value

  constructor (context, text, retainFormatting) {
    super(...arguments)
    this.#value = `${text}`
  }

  get type () {
    return Constants.INTERPOLATION_TEXT
  }

  get value () {
    return this.#value
  }
}
