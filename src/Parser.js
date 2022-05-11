import Template from './Template'
import TrackableRegistry from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'
import { sanitizeString } from './utilities/StringUtils'

export default class Parser {
  #view
  #retainFormatting
  #routers = {}
  #templates = {}
  #trackers = {}

  constructor (view, retainFormatting) {
    this.#view = view
    this.#retainFormatting = retainFormatting
  }

  get templates () {
    return this.#templates
  }

  get trackers () {
    return this.#trackers
  }

  parse (template) {
    const { strings, interpolations } = template

    return interpolations.length === 0
      ? strings[0] // TODO: May want to sanitize and convert back to html
      : strings.reduce((result, string, i) => {
        result += string
        result += this.#parseInterpolation(interpolations[i])
        return result
      }, '')
  }

  // TODO: Handle other data structures, like maps, sets, etc
  #parseInterpolation (interpolation) {
    if (Array.isArray(interpolation)) {
      return interpolation.reduce((result, item) => {
        result += this.#parseInterpolation(item)
        return result
      }, '')
    }
  
    if (interpolation instanceof Template) {
      const { id, type } = interpolation
      this.#templates[id] = interpolation
      return `<template id="${id}" class="${type} template"></template>`
    }

    if (interpolation instanceof TrackingInterpolation) {
      const { id } = interpolation
      const tracker = TrackableRegistry.registerContentTracker(interpolation, this.#view)
      this.#trackers[id] = tracker
      return `<template class="tracker" id="${id}"></template>`
    }

    switch (typeof interpolation) {
      case 'undefined':
      case 'boolean': return ''

      case 'string':
      case 'number': return this.#retainFormatting ? interpolation : sanitizeString(interpolation)

      // TODO: Handle other data structures, like maps, sets, etc
    
      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }
  }
}