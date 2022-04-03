import Template from './Template.js'
import { StringInterpolation, TrackingInterpolation } from './Interpolation.js'

export default class Parser {
  #interpolations = []
  #templates = []
  #trackers = []

  get interpolations () {
    return this.#interpolations
  }

  get templates () {
    return this.#templates
  }

  get trackers () {
    return this.#trackers
  }

  parse (template) {
    const { interpolations, strings } = template

    return interpolations.length === 0 ? strings.join(' ') : strings.reduce((result, string, index) => {
      result += string

      const interpolation = interpolations[index]
      result += interpolation ? this.#parseInterpolation(interpolation) : ''
      
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
      const tracker = TrackableRegistry.registerContentTracker(interpolation)
      this.#trackers.push(tracker)
      return `<template class="tracker" id="${tracker.id}"></template>`
    }

    let type

    switch (typeof interpolation) {
      case 'boolean': return ''

      case 'string':
      case 'number':
        interpolation = new StringInterpolation(interpolation)
        type = 'string'
        break

      // TODO: Handle other data structures, like maps, sets, etc

      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }

    this.#interpolations.push(interpolation)
    return `<template class="${type} interpolation" id="${interpolation.id}"></template>`
  }
}