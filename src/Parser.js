import Template from './Template.js'
import TrackableRegistry from './registries/TrackableRegistry.js'
import { TrackingInterpolation } from './Interpolation.js'
import { sanitizeString } from './utilities/StringUtils.js'

export default class Parser {
  #parent
  #options
  #interpolations = []
  #templates = []
  #trackers = []

  constructor (parent, options) {
    this.#parent = parent
    this.#options = options
  }

  get interpolations () {
    return this.#interpolations
  }

  get templates () {
    return this.#templates
  }

  get trackers () {
    return this.#trackers
  }

  parse (template, { retainFormatting }) {
    const { interpolations, strings } = template

    return interpolations.length === 0 ? strings[0] : strings.reduce((result, string, index) => {
      result += string

      const interpolation = interpolations[index]
      result += this.#parseInterpolation(interpolation)
      
      return result
    }, '')
  }

  #parseInterpolation (interpolation) {
    if (Array.isArray(interpolation)) {
      return interpolation.reduce((result, item) => {
        result += this.#parseInterpolation(item)
        return result
      }, '')
    }

    if (interpolation instanceof Template) {
      this.#templates.push(interpolation)
      return `<template class="template" id="${interpolation.id}"></template>`
    }

    if (interpolation instanceof TrackingInterpolation) {
      const tracker = TrackableRegistry.registerContentTracker(interpolation, this.#parent)
      this.#trackers.push(tracker)
      return `<template class="tracker" id="${tracker.id}"></template>`
    }

    let type

    switch (typeof interpolation) {
      case 'undefined':
      case 'boolean': return ''

      case 'string':
      case 'number': return `${sanitizeString(`${interpolation}`, this.#options)}`

      // TODO: Handle other data structures, like maps, sets, etc

      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }
  }
}