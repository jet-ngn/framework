import Template from '../Template'
import DataBindingInterpolation from '../DataBindingInterpolation'
import { sanitizeString } from './StringUtils'

function createTemplate (collection, property, { id }, classNames) {
  collection[property] = {
    ...(collection[property] ?? {}),
    [id]: arguments[2]
  }

  return `<template id="${id}" class="${classNames} template"></template>`
}

function getTarget (type) {
  switch (type) {
    case 'html': return document.createElement('template')
    case 'svg': return document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    default: throw new Error(`Templates of type "${type}" are not supported`)
  }
}

export function parse (template, retainFormatting) {
  const result = {
    bindings: null,
    templates: null 
  }

  const { strings, interpolations } = template
  const target = getTarget(template.type)

  target.innerHTML = interpolations.length === 0
  ? strings[0] // TODO: May want to sanitize and convert back to html
  : strings.reduce((final, string, i) => final + string + parseInterpolation(interpolations[i], result, retainFormatting), '')

  return {
    fragment: target.content,
    ...result
  }
}

function parseInterpolation (interpolation, result, retainFormatting) {
  if (Array.isArray(interpolation)) {
    return interpolation.reduce((result, item) => result += parseInterpolation(item, ...arguments.slice(1)), '')
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