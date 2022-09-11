import Template from '../Template'
import DataBindingInterpolation from '../DataBindingInterpolation'
import { sanitizeString } from './StringUtils'

const htmlTemplate = document.createElement('template')
const svgTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

function createTemplate (collection, property, { id }, classNames) {
  collection[property] = {
    ...(collection[property] ?? {}),
    [id]: arguments[2]
  }

  return `<template id="${id}" class="${classNames} template"></template>`
}

function getTarget (type) {
  switch (type) {
    case 'html': return htmlTemplate.cloneNode()
    case 'svg': return svgTemplate.cloneNode()
    default: throw new Error(`Templates of type "${type}" are not supported`)
  }
}

export function parse (template, retainFormatting) {
  const result = {
    bindings: null,
    templates: null 
  }

  const { strings, interpolations } = template
  let target = getTarget(template.type)

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

function parseInterpolation (interpolation, result, retainFormatting) {
  if (Array.isArray(interpolation)) {
    return interpolation.reduce((output, item) => output + parseInterpolation(item, result, retainFormatting), '')
  }

  if (interpolation instanceof Template) {
    return createTemplate(result, 'templates', interpolation, interpolation.type)
  }

  if (interpolation instanceof DataBindingInterpolation) {
    return createTemplate(result, 'bindings', interpolation, 'data_binding')
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