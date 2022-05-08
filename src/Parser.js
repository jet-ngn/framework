import Template from './Template'
import { sanitizeString } from './utilities/StringUtils'

export default class Parser {
  #retainFormatting
  #routers = {}
  #templates = {}
  #trackers = {}

  constructor (retainFormatting) {
    this.#retainFormatting = retainFormatting
  }

  get templates () {
    return this.#templates
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
    // if (Array.isArray(interpolation)) {
    //   return console.log('PARSE ARRAY')
    // }
  
    if (interpolation instanceof Template) {
      const { id, type } = interpolation
      this.#templates[id] = interpolation
      return `<template id="${id}" class="${type} template">`
    }

    // if (interpolation instanceof EmbeddedRouter) {
    //   return this.#router
    // }

    switch (typeof interpolation) {
      case 'undefined':
      case 'boolean': return ''

      case 'string':
      case 'number': return this.#retainFormatting ? interpolation : sanitizeString(interpolation)
    
      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }
  }
}