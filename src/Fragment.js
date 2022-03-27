import Template from './Template.js'
import { Tracker } from './registries/ObservableRegistry.js'

export default class Fragment {
  #parent
  #template
  #options

  #children = {
    entities: [],
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

  async render () {
    const template = this.#template.type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    template.innerHTML = await this.#parse()

    // TODO: Handle bindings, attributes, listeners

    await this.#processChildren(template.content)
    return template.content
  }

  async #parse () {
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

      string += await this.#parseInterpolation(interpolations[i])
    }

    return string
  }

  async #parseInterpolation (interpolation) {
    if (Array.isArray(interpolation)) {
      return console.log('HANDLE PLAIN ARRAY')
    }

    if (interpolation instanceof Template) {
      this.#children.templates.push(interpolation)
      return `<template class="template" id="${template.id}"></template>`
    }

    if (interpolation instanceof Tracker) {
      this.#children.trackers.push(interpolation)
      return `<template class="tracker" id="${interpolation.id}"></template>`
    }

    // switch (typeof interpolation) {
    //   case 'string':
    //   case 'number': return console.log('HANDLE PLAIN STRING/NUMBER')
    //   case 'boolean': return !!interpolation ? 'true' : null
    
    //   default: throw new TypeError(`Invalid template string interpolation type "${typeof interpolation}"`)
    // }
  }

  async #processChildren (content) {
    const { trackers, templates, entities } = this.#children

    trackers.forEach(tracker => {
      tracker.render(content.getElementById(tracker.id), this.#options)
    })

    // for (let i = 0, { length } = children; i < length; i++) {
    //   const node = children[i]
      
    //   if (node.tagName !== 'TEMPLATE') {
    //     await this.#processChildren([...node.children])
    //     continue
    //   }

    //   const { classList } = node

    //   if (classList.contains('tracker')) {
    //     console.log(node);
    //     // const tracker = TrackerRegistry.get(node.id)
    //     // console.log(tracker);
    //     // tracker.render(node)
    //     continue
    //   }
    // }
  }
}