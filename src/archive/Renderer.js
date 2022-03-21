import { Tag } from '../Tag.js'
import { sanitizeString } from '../utilities/StringUtils.js'
import { Interpolations } from '../Constants.js'

export function parseTag ({ strings, interpolations, bindings }, cfg) {
  
}

// export function parseTag ({ strings, interpolations, bindings }, cfg) {
//   let html
  
//   if (interpolations.length === 0) {
//     html = strings.join('')
//   } else {
//     for (let i = 0, length = strings.length; i < length; i++) {
//       html += strings[i]

//       if (i >= interpolations.length) {
//         continue
//       }

//       html += parseInterpolation(interpolations[i], cfg) ?? ''
//     }
//   }

//   // console.log(bindings);

//   return html
// }

function parseInterpolation (interpolation, cfg) {
  if (Array.isArray(interpolation)) {
    return parseArray(interpolation, cfg)
  }

  switch (typeof interpolation) {
    case 'string':
    case 'number': return sanitizeString(interpolation, cfg)
    case 'boolean': return interpolation ? 'true' : null
    case 'object': return parseObject(interpolation, cfg)
    case 'function': return parseFunction(interpolation, cfg)
    default: return null
  }
}

function parseFunction (func, { entity }) {
  return parseTag(func.call(entity), arguments[1])
}

function parseObject (obj, { entity, retainFormatting, trackers }) {
  if (obj instanceof Tag) {
    return parseTag(...arguments)
  }

  const { type } = obj

  switch (type) {
    case Interpolations.Tracker:
      const tracker = trackers.register(obj)
      return `<template class="${tracker.type} tracker" id="${tracker.id}"></template>`

    case Interpolations.Partial: 
      return parseTag(obj.render(entity), arguments[1])
  
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
      trackers.getNodes(node.id).forEach(node => fragment.append(node))
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