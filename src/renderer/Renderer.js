import { typeOf } from 'NGN/libdata'
import { Tag } from './Tags.js'
import { sanitizeString } from '../utilities/StringUtils.js'

export function parseTag ({ strings, interpolations }, cfg) {
  return interpolations.length > 0
    ? parseInterpolations(arguments[0], cfg)
    : strings.join('')
}

function parseInterpolations ({ strings, interpolations }, cfg) {
  let string = ''

  for (let i = 0, length = strings.length; i < length; i++) {
    string += strings[i]

    if (i >= interpolations.length) {
      continue
    }

    string += parseInterpolation(interpolations[i], cfg) ?? ''
  }

  return string
}

function parseInterpolation (interpolation, cfg) {
  const type = typeOf(interpolation)

  switch (type) {
    case 'string':
    case 'number': return sanitizeString(interpolation, cfg)
    case 'boolean': return interpolation ? 'true' : null
    case 'array': return parseArray(interpolation, cfg)
    case 'object': return parseObject(interpolation, cfg)
    default: return null
  }
}

function parseObject (obj, { retainFormatting, trackers }) {
  if (obj instanceof Tag) {
    return parseTag(...arguments)
  }

  const { type } = obj

  switch (type) {
    case 'tracker':
      const tracker = trackers.register(obj, { retainFormatting })
      return `<template class="${tracker.type} tracker" id="${tracker.id}"></template>`
  
    default: 
      console.warn(obj)
      throw new Error(`Invalid template string interpolation`)
  }
}

function attachTrackers (trackers, ...nodes) {
  for (let i = 0, length = nodes.length; i < length; i++) {
    const node = nodes[i]

    if (node.tagName === 'TEMPLATE') {
      const fragment = document.createDocumentFragment()
      trackers.generateNodes(node.id).forEach(node => fragment.append(node))

      node.replaceWith(fragment)
    } else {
      attachTrackers(trackers, ...node.children)
    }
  }
}

export function getDOMFragment (type, string, { trackers }) {
  let template = type === 'svg'
    ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    : document.createElement('template')

  template.innerHTML = string

  if (trackers.hasTrackers) {
    attachTrackers(trackers, ...template.content.children)
  }

  return template.content
}

function parseArray (arr, { retainFormatting }) {
  return arr.reduce((string, part) => {
    string += parseInterpolation(part, { retainFormatting })
    return string
  }, '')
}

export function reconcileNodes (original, update) {
  const types = {
    original: original.constructor.name,
    update: update.constructor.name
  }

  if (types.original !== types.update) {
    return original.replaceWith(update)
  }

  switch (types.original) {
    case 'Text': return reconcileTextNodes(original, update)
    case 'Element': return console.log('REC ELEMENT NODES')
  
    default: throw new Error(`Cannot reconcile node type "${types.original}"`)
  }
}

function reconcileTextNodes (original, update) {
  if (update.data !== original.data) {
    original.data = update.data
  }
}