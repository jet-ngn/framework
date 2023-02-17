// import HTMLTemplate from './HTMLTemplate'
// import SVGTemplate from './templates/SVGTemplate'
// import CSSTemplate from './templates/CSSTemplate'

class Binding {
  #id = crypto.randomUUID()

  constructor ({ type }) {
    // TODO: Register binding on Data Worker
  }

  get id () {
    return this.#id
  }
}

function parseBindingInterpolation (interpolation, result) {
  const { id } = new Binding(interpolation)
  result.bindings.push(id)
  return `<template type="${interpolation.type}" id="${id}"></template>`
}

function parseTemplateInterpolation ({ raw, bindings }, result) {
  result.bindings.push(...bindings)
  return raw
}

function parseInterpolation (interpolation, result) {
  const { type } = interpolation ?? {}
  
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
    case 'svg': return parseTemplateInterpolation(...arguments)
    case 'binding': return parseBindingInterpolation(...arguments)
    default: throw new TypeError(`Invalid Interpolation`) // TODO: better error message
  }
}

export function html (strings, ...interpolations) {
  return strings.reduce((result, string, i) => ({
    ...result,
    raw: result.raw += string.trim() + parseInterpolation(interpolations[i], result)
  }), {
    type: 'html',
    bindings: [],
    raw: ''
  })
}

// export function svg () {
//   return new SVGTemplate(...arguments)
// }

// export function css () {
//   return new CSSTemplate(...arguments)
// }

// export function md (strings, ...interpolations) {
//   return new Template({ type: 'md', strings, interpolations })
// }