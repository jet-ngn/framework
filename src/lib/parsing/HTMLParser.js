import Template from './templates/Template'
import DataBindingInterpolation from '../data/DataBindingInterpolation'
import { sanitizeString } from '../../utilities/StringUtils'

const htmlTemplate = document.createElement('template')
const svgTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

export function parseHTML (template, { retainFormatting }) {
  const result = {
    bindings: {},
    templates: {} 
  }

  const { strings, interpolations } = template
  let target = getTarget(template.constructor.name)

  let output = interpolations.length === 0
  ? strings[0] // TODO: May want to sanitize and convert back to html
  : strings.reduce((final, string, i) => final + string + parseInterpolation(interpolations[i], result, retainFormatting), '')

  target.innerHTML = retainFormatting ? output : output.trim()

  let fragment = target.content

  if (!fragment) {
    fragment = document.createDocumentFragment()
    fragment.append(...target.children)
  }

  target = null
  
  return {
    fragment,
    ...result
  }
}

function createTemplate (collection, property, { id }) {
  collection[property][id] = arguments[2]
  return `<template id="${id}"></template>`
}

function getTarget (constructor) {
  switch (constructor) {
    case 'HTMLTemplate': return htmlTemplate.cloneNode()
    case 'SVGTemplate': return svgTemplate.cloneNode()
    default: throw new Error(`Invalid template`)
  }
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