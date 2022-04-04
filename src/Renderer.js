import Parser from './Parser.js'
import Entity from './Entity.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import EntityRegistry from './registries/EntityRegistry.js'
import { TrackingInterpolation } from './Interpolation.js'
import { typeOf } from '@ngnjs/libdata'

export function getOptions (options, node) {
  return {
    retainFormatting: options.retainFormatting || !!node.closest('pre')
  }
}

export default class Renderer {
  #parent
  #parser = new Parser
  #options

  constructor (parent, options) {
    this.#parent = parent
    this.#options = options
  }

  render (template, isChild = false) {
    const { attributes, entityConfig, listeners, type } = template

    const target = type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    target.innerHTML = this.#parser.parse(template)

    const { content } = target
    const nodes = [...content.children]

    if (!!attributes) {
      this.#bindAttributes(nodes, attributes)
    }

    if (!!listeners) {
      this.#bindListeners(nodes, listeners)
    }

    const { interpolations, templates, trackers } = this.#parser

    this.#renderCollection(content, interpolations, (interpolation, placeholder) => {
      placeholder?.replaceWith(interpolation.render(getOptions(this.#options, placeholder)))
    })

    this.#renderCollection(content, trackers, (tracker, placeholder) => {
      placeholder && tracker?.render(this.#parent, placeholder, getOptions(this.#options, placeholder))
    })

    this.#renderCollection(content, templates, (template, placeholder) => {
      if (placeholder) {
        const renderer = new Renderer(this.#parent, getOptions(this.#options, placeholder))
        placeholder.replaceWith(renderer.render(template, true))
      }
    })

    if (entityConfig) {
      if (content.childElementCount > 1) {
        throw new Error(`Cannot bind entity to more than one node`)
      }

      if (!isChild) {
        this.#parent.children.length = 0
      }

      const entity = new Entity(content.firstElementChild, entityConfig, this.#parent)
      const { mount } = EntityRegistry.register(entity, entityConfig)
      this.#parent.children.push(entity)
      mount()
    }

    return content
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

  #bindListeners (nodes, listeners) {
    if (nodes.length === 0) {
      throw new Error(`Cannot bind event listeners to non-element nodes`)
    }

    if (nodes.length > 1) {
      throw new Error(`Cannot bind event listeners to more than one node`)
    }

    for (let evt in listeners) {
      listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(this, nodes[0], evt, handler, cfg))
    }
  }

  #renderChild (content, child, callback) {
    return callback(child, content.getElementById(child.id))
  }

  #renderCollection (content, collection, callback) {
    for (let item of collection) {
      this.#renderChild(content, item, callback)
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
      default: throw new TypeError(`"${this.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
    }
  }
}