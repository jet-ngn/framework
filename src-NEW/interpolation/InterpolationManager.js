import Tag from '../tag/Tag.js'
import Template from '../renderer/Template.js'

import ArrayInterpolation from './ArrayInterpolation.js'
import BatchInterpolation from './BatchInterpolation.js'
import BindingInterpolation from './BindingInterpolation.js'
import DataInterpolation from './DataInterpolation.js'
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

    const { id } = interpolation
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
    const defaultArgs = [context, interpolation, index, retainFormatting]

    if (['string', 'number'].includes(typeof interpolation)) {
      return new TextInterpolation(...defaultArgs)
    }

    if (interpolation instanceof Tag) {
      return new TagInterpolation(context, new Template(context, interpolation, retainFormatting), index, retainFormatting)
    }

    if (interpolation === false) {
      return new PlaceholderInterpolation(...defaultArgs)
    }

    if (Array.isArray(interpolation)) {
      return new ArrayInterpolation(...defaultArgs)
    }

    if (typeof interpolation !== 'object') {
      throw new TypeError(`Invalid interpolation ${interpolation}`)
    }

    switch (interpolation.type) {
      case 'batch': return new BatchInterpolation(...defaultArgs)
      case 'bind': return new BindingInterpolation(...defaultArgs)
      case 'data': return new DataInterpolation(...defaultArgs)
      case 'partial': return new PartialInterpolation(...defaultArgs)
      case 'component': return new ComponentInterpolation(...defaultArgs)
      default: throw new TypeError(`Invalid interpolation type "${interpolation.type}"`)
    }
  }

  getInterpolation (id) {
    return this.#interpolations[id]
  }

  hasInterpolation (id) {
    return this.#interpolations.hasOwnProperty(id)
  }
}
