import { NANOID, typeOf } from '@ngnjs/libdata'
import Template from './Template.js'
import TrackableRegistry from './registries/TrackableRegistry.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import { processList } from './utilities/ListUtils.js'
import { sanitizeString } from './utilities/StringUtils.js'
import { TrackingInterpolation } from './Interpolation.js'

class Interpolation {
  #id = NANOID()
  #interpolation

  constructor (interpolation) {
    this.#interpolation = interpolation
  }

  get id () {
    return this.#id
  }

  get interpolation () {
    return this.#interpolation
  }
}

class StringInterpolation extends Interpolation {
  render (options) {
    return sanitizeString(`${this.interpolation}`, options)
  }
}

export default class Fragment {
  #parent
  #template
  #options
  #entity = null

  #children = {
    interpolations: [],
    templates: [],
    trackers: []
  }

  constructor (entity, template, options) {
    this.#parent = entity
    this.#template = template
    this.#options = options
    this.#entity = template.entity
  }

  get children () {
    return this.#children
  }

  get entity () {
    return this.#entity
  }

  get options () {
    return this.#options
  }

  render (children) {
    const { attributes, listeners, type } = this.#template

    const template = type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    template.innerHTML = this.#parse(children)
    const nodes = [...template.content.children]

    if (!!attributes) {
      this.#bindAttributes(nodes, attributes)
    }

    if (!!listeners) {
      this.#bindListeners(nodes, listeners)
    }

    return template.content
  }

  #bindAttributes (nodes, attributes) {
    if (nodes.length === 0) {
      throw new Error(`Cannot bind attributes to non-element nodes`)
    }

    if (nodes.length > 1) {
      throw new Error(`Cannot bind attributes to more than one node`)
    }

    const node = nodes[0]

    for (let attribute in attributes) {
      this.#setAttribute(node, attribute, attributes[attribute])
    }
  }

  #setAttribute (node, name, value) {
    if (Array.isArray(value)) {
      const list = processList(value)
      return node.setAttribute(name, list.join(' '))
    }

    if (value instanceof TrackingInterpolation) {
      return console.log('HANDLE ATTRIBUTE TRACKER')
    }

    let type = typeOf(value)

    switch (type) {
      case 'string':
      case 'number': return node.setAttribute(name, value)
      case 'boolean': return value && node.setAttribute(name, '')
      case 'object': return Object.keys(value).forEach(slug => this.#setAttribute(node, `${name}-${slug}`, value[slug]))
      default: throw new TypeError(`"${this.#parent.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
    }
  }

  #bindListeners (nodes, listeners) {
    if (nodes.length === 0) {
      throw new Error(`Cannot bind event listeners to non-element nodes`)
    }

    if (nodes.length > 1) {
      throw new Error(`Cannot bind event listeners to more than one node`)
    }

    for (let evt in listeners) {
      listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(this.#parent, nodes[0], evt, handler, cfg))
    }
  }

  #parse (children) {
    const { interpolations, strings } = this.#template

    if (interpolations.length === 0) {
      return strings.join('')
    }

    let string = ''

    for (let i = 0, { length } = strings; i < length; i++) {
      string += strings[i]

      const interpolation = interpolations[i]
      string += interpolation ? this.#parseInterpolation(interpolation, children) : ''
    }

    return string
  }

  #parseInterpolation (interpolation, children) {
    if (Array.isArray(interpolation)) {
      return interpolation.reduce((result, item) => {
        result += this.#parseInterpolation(item, children)
        return result
      }, '')
    }

    if (interpolation instanceof Template) {
      this.#children.templates.push(interpolation)
      return `<template class="template" id="${interpolation.id}"></template>`
    }

    if (interpolation instanceof TrackingInterpolation) {
      const tracker = TrackableRegistry.registerContentTracker(interpolation, children)
      this.#children.trackers.push(tracker)
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

    this.#children.interpolations.push(interpolation)
    return `<template class="${type} interpolation" id="${interpolation.id}"></template>`
  }
}