import Template from './Template'
import { sanitizeString } from './utilities/StringUtils'

export default class Parser {
  #retainFormatting
  #templates = null
  #trackers = null

  constructor ({ retainFormatting }) {
    this.#retainFormatting = retainFormatting
  }

  get retainFormatting () {
    return this.#retainFormatting
  }

  get templates () {
    return this.#templates
  }

  get trackers () {
    return this.#trackers
  }

  parse (template) {
    const { strings, interpolations } = template
    const target = this.#getTarget(template.type)

    target.innerHTML = interpolations.length === 0
    ? strings[0] // TODO: May want to sanitize and convert back to html
    : strings.reduce((result, string, i) => {
      result += string
      result += this.#parseInterpolation(interpolations[i])
      return result
    }, '')

    return target.content
  }

  #getTarget (type) {
    switch (type) {
      case 'html': return document.createElement('template')
      case 'svg': return document.createElementNS('http://www.w3.org/2000/svg', 'svg')

      default: throw new Error(`Templates of type "${type}" are not supported`)
    }
  }

  #parseInterpolation (interpolation) {
    if (Array.isArray(interpolation)) {
      return interpolation.reduce((result, item) => result += this.#parseInterpolation(item), '')
    }
  
    if (interpolation instanceof Template) {
      this.#templates = this.#templates ?? {}
      
      const { id, type } = interpolation
      this.#templates[id] = interpolation

      return `<template id="${id}" class="${type} template"></template>`
    }

    // if (interpolation instanceof TrackingInterpolation) {
    //   const { id } = interpolation
    //   const tracker = TrackableRegistry.registerContentTracker(interpolation, this.#view)
    //   this.#trackers[id] = tracker
    //   return `<template class="tracker" id="${id}"></template>`
    // }

    switch (typeof interpolation) {
      case 'undefined':
      case 'boolean': return ''

      case 'string':
      case 'number': return this.#retainFormatting ? interpolation : sanitizeString(`${interpolation}`)

      // TODO: Handle other data structures, like maps, sets, etc
    
      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }
  }
}