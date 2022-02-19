import { typeOf } from 'NGN/libdata'
import { Tag } from './Tags.js'
import { sanitizeString } from './StringUtils.js'

export function parseTag ({ strings, interpolations }, retainFormatting = false, trackers) {
  return interpolations.length > 0
    ? parseInterpolations(arguments[0], retainFormatting, trackers)
    : strings.join('')
}

function parseInterpolations ({ strings, interpolations }, retainFormatting, trackers) {
  let string = ''

  for (let i = 0, length = strings.length; i < length; i++) {
    string += strings[i]

    if (i >= interpolations.length) {
      continue
    }

    string += parseInterpolation(interpolations[i], retainFormatting, trackers) ?? ''

    // if (typeof parsed !== 'object') {
    //   string += parsed
    //   continue
    // }

    // if (tracker) {
    //   const { id, tracker } = parsed
    //   trackers[id] = tracker
    //   string += `<template id="${id}"></template>`
    //   continue
    // }

    // string += value
  }

  return string
}

function parseInterpolation (interpolation, retainFormatting, trackers) {
  const type = typeOf(interpolation)

  switch (type) {
    case 'string':
    case 'number': return sanitizeString(interpolation, retainFormatting)
    case 'boolean': return interpolation ? 'true' : null
    case 'array': return parseArray(interpolation, retainFormatting, trackers)
    case 'object': return parseObject(interpolation, retainFormatting, trackers)
    default: return null
  }
}

function parseObject (obj, retainFormatting, trackers) {
  if (obj instanceof Tag) {
    return parseTag(...arguments)
  }

  const { type } = obj

  switch (type) {
    case 'tracker':
      const tracker = trackers.register(obj.target, obj.property, obj.transform, retainFormatting)
      return `<template id="${tracker.id}"></template>`
  
    default: 
      console.warn(obj)
      throw new Error(`Invalid template string interpolation`)
  }
}

function attachTrackers (trackers, ...nodes) {
  for (let i = 0, length = nodes.length; i < length; i++) {
    const node = nodes[i]

    if (node.tagName === 'TEMPLATE') {
      const tracker = trackers.get(node.id)
      tracker.node = document.createTextNode(tracker.value)
      node.replaceWith(tracker.node)
    } else {
      attachTrackers(trackers, ...node.children)
    }
  }
}

export function getDOMFragment (type, string, trackers) {
  let template = type === 'svg'
    ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    : document.createElement('template')

  template.innerHTML = string

  if (trackers.hasTrackers) {
    attachTrackers(trackers, ...template.content.children)
  }

  return template.content
}

function parseArray (arr, retainFormatting) {
  return arr.reduce((string, part) => {
    string += parseInterpolation(part, retainFormatting)
    return string
  }, '')
}