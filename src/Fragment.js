import { typeOf } from '@ngnjs/libdata'
import Template from './Template.js'
import ObservableRegistry, { Tracker } from './registries/ObservableRegistry.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import { processList } from './utilities/ListUtils.js'

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

  render () {
    const { attributes, listeners, type } = this.#template

    const template = type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    template.innerHTML = this.#parse()
    const children = [...template.content.children]

    if (!!attributes) {
      this.#bindAttributes(children, attributes)
    }

    // if (this.#attributes) {
    //   this.#bindAttributes(context, node)
    // }

    // TODO: Handle bindings, attributes, listeners
    if (!!listeners) {
      this.#bindListeners(children, listeners)
    }

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

      let type = typeOf(value)
  
      if (type === 'object') {
        type = value.type
      }

      switch (type) {
        case 'string':
        case 'number':
          node.setAttribute(name, value)
          continue
  
        case 'boolean':
          value && node.setAttribute(name, '')
          continue
  
        // case Constants.Tracker:
        //   const tracker = TrackerRegistry.registerAttributeTracker(context, node, name, value)
        //   await tracker.update()
        //   continue
  
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

  #processChildren (content) {
    const { trackers, templates, entities } = this.#children

    trackers.forEach(tracker => {
      tracker.render(this.#parent, content.getElementById(tracker.id), this.#options)
    })

    // for (let i = 0, { length } = children; i < length; i++) {
    //   const node = children[i]
      
    //   if (node.tagName !== 'TEMPLATE') {
    //     this.#processChildren([...node.children])
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