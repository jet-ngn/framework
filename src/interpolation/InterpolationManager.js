import Constants from '../Constants.js'

import Tag from '../tag/Tag.js'
import Template from '../renderer/Template.js'

import ArrayInterpolation from './ArrayInterpolation.js'
import BatchInterpolation from './BatchInterpolation.js'
import BindingInterpolation from './BindingInterpolation.js'
import DataBindingInterpolation from './DataBindingInterpolation.js'
import PartialInterpolation from './PartialInterpolation.js'
import PlaceholderInterpolation from './PlaceholderInterpolation.js'
import TagInterpolation from './TagInterpolation.js'
import TextInterpolation from './TextInterpolation.js'

export default class InterpolationManager {
  #template
  #interpolations = {}

  constructor (template) {
    this.#template = template
  }

  get interpolations () {
    return this.#interpolations
  }

  addInterpolation (interpolation, index) {
    interpolation = this.createInterpolation(interpolation, index)

    const id = `i${index}`
    interpolation.id = id
    this.#interpolations[id] = interpolation

    return this.#interpolations[id]
  }

  appendInterpolation (interpolation) {
    const count = Object.keys(this.#interpolations).length
    interpolation.index = count
    this.interpolations[`i${count}`] = interpolation
  }

  createInterpolation (interpolation, index) {
    const { context, retainFormatting } = this.#template
    const defaultArgs = [context, interpolation, retainFormatting]

    if (interpolation === false) {
      return new PlaceholderInterpolation(...defaultArgs)
    }

    if (interpolation === true || ['string', 'number'].includes(typeof interpolation)) {
      return new TextInterpolation(...defaultArgs)
    }

    if (interpolation instanceof Tag) {
      return new TagInterpolation(
        context,
        new Template(context, interpolation, retainFormatting),
        retainFormatting
      )
    }

    if (Array.isArray(interpolation)) {
      return new ArrayInterpolation(...defaultArgs)
    }

    if (NGN.typeof(interpolation) !== 'object') {
      throw new TypeError(`Invalid interpolation`, interpolation)
    }

    switch (interpolation.type) {
      case Constants.INTERPOLATION_BATCH: return new BatchInterpolation(...defaultArgs)
      case Constants.INTERPOLATION_BINDING: return new BindingInterpolation(...defaultArgs)
      case Constants.INTERPOLATION_DATABINDING: return new DataBindingInterpolation(...defaultArgs)
      case Constants.INTERPOLATION_PARTIAL: return new PartialInterpolation(...defaultArgs)
      default: throw new TypeError(`Invalid interpolation`, interpolation)
    }
  }

  getInterpolation (id) {
    return this.#interpolations[id]
  }

  hasInterpolation (id) {
    return this.#interpolations.hasOwnProperty(id)
  }
}
