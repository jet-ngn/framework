import Template from './Template'
import { sanitizeString } from './utilities/StringUtils'

export default class Parser {
  static #templates
  static #trackers
  
  static parse (template, retainFormatting) {
    this.#templates = null
    this.#trackers = null

    const { strings, interpolations } = template
    const target = this.#getTarget(template.type)

    target.innerHTML = interpolations.length === 0
    ? strings[0] // TODO: May want to sanitize and convert back to html
    : strings.reduce((result, string, i) => {
      result += string
      result += this.#parseInterpolation(interpolations[i], retainFormatting)
      return result
    }, '')

    return {
      fragment: target.content,
      templates: this.#templates,
      trackers: this.#trackers
    }
  }

  static #getTarget (type) {
    switch (type) {
      case 'html': return document.createElement('template')
      case 'svg': return document.createElementNS('http://www.w3.org/2000/svg', 'svg')

      default: throw new Error(`Templates of type "${type}" are not supported`)
    }
  }

  static #parseInterpolation (interpolation, retainFormatting) {
    if (Array.isArray(interpolation)) {
      return interpolation.reduce((result, item) => result += this.#parseInterpolation(item, ...arguments.slice(1)), '')
    }
  
    if (interpolation instanceof Template) {
      this.#templates = this.#templates ?? {}
      
      const { id, type } = interpolation
      this.#templates[id] = interpolation

      return `<template id="${id}" class="${type} template"></template>`
    }

    // if (interpolation instanceof TrackingInterpolation) {
    //   output.trackers = output.trackers ?? {}
    //   const { id } = interpolation
    //   const tracker = TrackableRegistry.registerContentTracker(interpolation, this.#view)
    //   trackers[id] = tracker
    //   return `<template class="tracker" id="${id}"></template>`
    // }

    switch (typeof interpolation) {
      case 'undefined':
      case 'boolean': return ''

      case 'string':
      case 'number': return retainFormatting ? interpolation : sanitizeString(`${interpolation}`)

      // TODO: Handle other data structures, like maps, sets, etc
    
      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }
  }
}