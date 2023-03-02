export default class HTMLTemplate {
  #bindings = new Set
  #raw = ''

  constructor (strings, ...interpolations) {
    for (let i = 0, { length } = strings; i < length; i++) {
      this.#raw += strings[i].trim() + this.#processInterpolation(interpolations[i])
    }
  }

  get bindings () {
    return this.#bindings
  }

  get raw () {
    return this.#raw
  }

  #processInterpolation (interpolation) {
    if (!interpolation) {
      return ''
    }

    const { type } = interpolation
    
    if (!type) {
      switch (typeof interpolation) {
        case 'string':
        case 'number':
        case 'boolean': return `${interpolation}`
        default: return ''
      }
    }
  
    switch (type) {
      case 'html':
      case 'svg': return this.#processTemplateInterpolation(...arguments)
      case 'bind': return this.#processBindingInterpolation(...arguments)
      default: throw new TypeError(`Invalid Interpolation`) // TODO: better error message
    }
  }

  #processBindingInterpolation ({ type, id }) {
    this.#bindings.add(id)
    return `<template type="${type}" id="${id}"></template>`
  }
  
  #processTemplateInterpolation (strings, ...interpolations) {
    console.log('CREATE TEMPLATE')
    // result.bindings.push(...bindings)
    // return raw
  }
}