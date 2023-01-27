import Template from './templates/Template'
import SVGTemplate from './templates/SVGTemplate'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import { sanitizeString } from '../utilities/strings'

export function parseHTML (template, { retainFormatting }) {
  const result = {
    bindings: {},
    templates: {} 
  }, { strings, interpolations } = template

  let output = interpolations.length === 0
    ? strings[0] // unescapeHTML(sanitizeString(strings[0]))
    : strings.reduce((final, string, i) => final + string + parseInterpolation(interpolations[i], result, retainFormatting), '')

  output = retainFormatting ? output : output.trim()

  return {
    fragment: template instanceof SVGTemplate ? getSVGFragment(output) : document.createRange().createContextualFragment(output),
    ...result
  }
}

function createTemplate (collection, property, { id }) {
  collection[property][id] = arguments[2]
  return `<template id="${id}"></template>`
}

function getSVGFragment (contents) {
  const template = document.createElement('template')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.innerHTML = contents.trim()
  template.content.append(svg)
  return template.content
}

function parseInterpolation (interpolation, result, retainFormatting) {
  if (Array.isArray(interpolation)) {
    return interpolation.reduce((output, item) => output + parseInterpolation(item, result, retainFormatting), '')
  }
  
  if (interpolation instanceof Template) {
    return createTemplate(result, 'templates', interpolation)
  }

  if (interpolation instanceof DataBindingInterpolation) {
    return createTemplate(result, 'bindings', interpolation, 'data_binding')
  }

  if (interpolation === null) {
    return ''
  }

  switch (typeof interpolation) {
    case 'undefined':
    case 'boolean': return ''

    case 'string':
    case 'number': return retainFormatting ? interpolation : sanitizeString(`${interpolation}`)

    // TODO: Handle other data structures, like maps, sets, etc
  
    default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
  }
}

// const htmlTemplate = document.createElement('template')
// const svgTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

// function getTarget (constructor) {
//   switch (constructor) {
//     case 'HTMLTemplate': return htmlTemplate.cloneNode()
//     case 'SVGTemplate': return svgTemplate.cloneNode()
//     default: throw new Error(`Invalid template`)
//   }
// }