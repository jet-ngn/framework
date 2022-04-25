import Parser from './Parser.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import EntityRegistry from './registries/EntityRegistry.js'
import TrackableRegistry from './registries/TrackableRegistry.js'
import { TrackingInterpolation } from './Interpolation.js'
import { typeOf } from '@ngnjs/libdata'
import AttributeList from './AttributeList.js'
import Template from './Template.js'

export function getOptions (options, node) {
  return {
    retainFormatting: options.retainFormatting || !!node.closest('pre')
  }
}

export default class Renderer {
  #parent
  #parser
  #options

  constructor (parent, options) {
    this.#parent = parent
    this.#options = options
    this.#parser = new Parser(parent)
  }

  render (template, isChild = false, tasks = []) {
    if (Array.isArray(template)) {
      return this.#renderArray(...arguments)
    }

    switch (template.type) {
      case 'html': return this.#renderHTML(...arguments)
      case 'svg': return this.#renderSVG(...arguments)
    
      default: throw new TypeError(`Invalid template type "${template.type}"`)
    }
  }

  #bindAttributes (node, attributes) {
    for (let attribute in attributes) {
      this.#setAttribute(node, attribute, attributes[attribute])
    }
  }

  #bindListeners (node, listeners) {
    for (let evt in listeners) {
      listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(this, node, evt, handler, cfg))
    }
  }

  #renderArray (arr, isChild = false, tasks = []) {
    const content = document.createDocumentFragment()

    arr.forEach(item => {
      let output

      if (Array.isArray(item)) {
        output = this.#renderArray(item, true, tasks)
      } else if (item instanceof Template) {
        output = this.render(item, true, tasks)
      } else {
        console.log('HANDLE PRIMITIVE')
      }

      content.append(output.content)
      tasks.push(...output.tasks)
    })

    return { content, tasks }
  }

  #renderChild (content, child, callback) {
    return callback(child, content.getElementById(child.id))
  }

  #renderCollection (content, collection, callback) {
    for (let item of collection) {
      this.#renderChild(content, item, callback)
    }
  }

  #renderHTML (template, isChild = false, tasks = []) {
    const { attributes, boundListeners, entityConfig, listeners, routeCfg } = template
    const target = document.createElement('template')

    target.innerHTML = this.#parser.parse(template, this.#options)
    
    const { content } = target
    const nodes = [...content.children]
    const hasAttributes = !!attributes
    const hasListeners = !!listeners

    if (hasAttributes || hasListeners) {
      if (nodes.length === 0) {
        throw new Error(`Cannot bind to non-element nodes`)
      }

      if (nodes.length > 1) {
        throw new Error(`Cannot bind to more than one node`)
      }

      const node = nodes[0]

      this.#bindAttributes(nodes, attributes)
      this.#bindListeners(nodes, listeners)
    }

    const { interpolations, templates, trackers } = this.#parser
    
    this.#renderCollection(content, interpolations, (interpolation, placeholder) => {
      placeholder?.replaceWith(interpolation.render(getOptions(this.#options, placeholder)))
    })

    this.#renderCollection(content, trackers, (tracker, placeholder) => {
      placeholder && tracker?.render(placeholder, getOptions(this.#options, placeholder))
    })
    
    this.#renderCollection(content, templates, (template, placeholder) => {
      if (placeholder) {
        const renderer = new Renderer(this.#parent, getOptions(this.#options, placeholder))
        const { content } = renderer.render(template, true, tasks)
        placeholder?.replaceWith(content)
      }
    })

    if (entityConfig) {
      if (content.childElementCount > 1) {
        throw new Error(`Cannot bind entity to more than one node`)
      }

      if (!isChild) {
        this.#parent.children.length = 0
      }

      const node = content.firstElementChild
      let config = entityConfig
      const options = { routeCfg, boundListeners }

      if (entityConfig instanceof TrackingInterpolation) {
        const tracker = TrackableRegistry.registerBindingTracker(node, config, this.#parent, options)
        config = tracker.value
      }
        
      tasks.push(() => {
        const { entity, mount } = EntityRegistry.register(node, config, this.#parent, options)
        this.#parent.children.push(entity)
        mount()
      })
    }

    return { content, tasks }
  }

  #renderSVG (template, isChild, tasks = []) {
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    target.innerHTML = this.#parser.parse(template, this.#options)
    const fragment = document.createDocumentFragment()
    fragment.append(...target.children)

    return {
      content: fragment,
      tasks
    }
  }

  #getExistingAttributeValue (node, name) {
    const value = node.getAttribute(name)
    return value ? value.trim().split(' ').map(item => item.trim()) : null
  }

  #setAttribute (node, name, value) {
    const existing = this.#getExistingAttributeValue(node, name)

    if (Array.isArray(value)) {
      const list = new AttributeList(node, name, value.concat(...(existing ?? [])), this.#parent)
      return node.setAttribute(name, list.value)
    }

    if (value instanceof TrackingInterpolation) {
      const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#parent)
      return tracker.reconcile()
    }

    let type = typeOf(value)

    switch (type) {
      case 'string':
      case 'number': return node.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
      case 'boolean': return value && node.setAttribute(name, '')
      
      case 'object': return Object.keys(value).forEach(slug => {
        name = `${name}-${slug}`
        const existing = this.#getExistingAttributeValue(node, name)
        return this.#setAttribute(node, name, `${existing.join(' ')} ${value[slug]}`.trim())
      })

      default: throw new TypeError(`"${this.#parent.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
    }
  }
}