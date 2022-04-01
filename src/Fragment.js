import { NANOID, typeOf } from '@ngnjs/libdata'
import Template from './Template.js'
import TrackableRegistry, { TrackingInterpolation } from './registries/TrackableRegistry.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import { processList } from './utilities/ListUtils.js'
import { sanitizeString } from './utilities/StringUtils.js'

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

class BooleanInterpolation extends Interpolation {
  render (options) {
    return !!this.interpolation ? 'true' : ''
  }
}

export default class Fragment {
  #parent
  #template
  #options

  #children = {
    entities: [],
    interpolations: [],
    templates: [],
    trackers: []
  }

  constructor (parent, template, options) {
    this.#parent = parent
    this.#template = template
    this.#options = options
  }

  get options () {
    return this.#options
  }

  render () {
    const { attributes, listeners, type } = this.#template

    const template = type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    template.innerHTML = this.#parse()

    // const children = [...template.content.children]

    // if (!!attributes) {
    //   this.#bindAttributes(children, attributes)
    // }

    // TODO: Handle Bindings

    // if (!!listeners) {
    //   this.#bindListeners(children, listeners)
    // }

    this.#processChildren(template.content)
    return template.content
  }

  #bindAttributes (nodes, attributes) {
    if (nodes.length > 1) {
      throw new Error(`Cannot bind attributes to multiple nodes`)
    }

    const node = nodes[0]

    for (let name in attributes) {
      const value = attributes[name]

      if (Array.isArray(value)) {
        return node.setAttribute(name, processList(value).join(' '))
      }

      // if (name === 'data') {
      //   processDataAttributes()
      //   continue
      // }

      if (value instanceof Tracker) {
        value.type = 'attribute'
        return value.output
      }

      let type = typeOf(value)

      switch (type) {
        case 'string':
        case 'number':
          node.setAttribute(name, value)
          continue
  
        case 'boolean':
          value && node.setAttribute(name, '')
          continue
  
        default: throw new TypeError(`"${this.#parent.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
      }
    }
  }

  #bindListeners (nodes, listeners) {
    if (nodes.length > 1) {
      throw new Error(`Cannot bind event listeners to multiple nodes`)
    }

    const node = nodes[0]

    for (let evt in listeners) {
      listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(this.#parent, node, evt, handler, cfg))
    }
  }

  #parse () {
    const { interpolations, strings } = this.#template

    if (interpolations.length === 0) {
      return strings.join('')
    }

    let string = ''

    for (let i = 0, { length } = strings; i < length; i++) {
      string += strings[i]

      if (i >= interpolations.length) {
        continue
      }

      string += this.#parseInterpolation(interpolations[i])
    }

    return string
  }

  #parseInterpolation (interpolation) {
    if (Array.isArray(interpolation)) {
      return interpolation.reduce((result, item) => {
        result += this.#parseInterpolation(item)
        return result
      }, '')
    }

    if (interpolation instanceof Template) {
      this.#children.templates.push(interpolation)
      return `<template class="template" id="${interpolation.id}"></template>`
    }

    if (interpolation instanceof TrackingInterpolation) {
      const tracker = TrackableRegistry.registerContentTracker(interpolation)
      this.#children.trackers.push(tracker)
      return `<template class="tracker" id="${tracker.id}"></template>`
    }

    switch (typeof interpolation) {
      case 'string':
      case 'number':
        interpolation = new StringInterpolation(interpolation)
        this.#children.interpolations.push(interpolation)
        return `<template class="string interpolation" id="${interpolation.id}"></template>`

      case 'boolean': 
        interpolation = new BooleanInterpolation(interpolation)
        this.#children.interpolations.push(interpolation)
        return `<template class="boolean interpolation" id="${interpolation.id}"></template>`
    
      default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    }
  }

  #processChildren (content) {
    const { interpolations, trackers, templates, entities } = this.#children

    interpolations.forEach(interpolation => {
      const placeholder = content.getElementById(interpolation.id)
      placeholder.replaceWith(interpolation.render(this.#getOptions(placeholder)))
    })

    trackers.forEach(tracker => {
      const placeholder = content.getElementById(tracker.id)
      tracker.render(this.#parent, placeholder, this.#getOptions(placeholder))
    })

    templates.forEach(template => {
      const placeholder = content.getElementById(template.id)
      const fragment = new Fragment(this.#parent, template, this.#getOptions(placeholder))
      placeholder.replaceWith(fragment.render())
    })
  }

  #getOptions (node) {
    return {
      retainFormatting: this.#options.retainFormatting || !!node.closest('pre')
    }
  }
}