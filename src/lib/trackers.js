import IdentifiableClass from '../IdentifiableClass'
import Renderer from '../Renderer'
import Template from '../Template'
import { shouldRetainFormatting } from '../Renderer'
import { sanitizeString } from '../utilities/StringUtils'

class Tracker extends IdentifiableClass {
  #parent
  #target
  #property
  #transform

  constructor ({ target, property, transform }, parent) {
    super('tracker')
    this.#parent = parent
    this.#target = target
    this.#property = property
    this.#transform = transform
  }

  get parent () {
    return this.#parent
  }

  get target () {
    return this.#target
  }

  get property () {
    return this.#property
  }

  get value () {
    return this.#transform(this.#property ? this.#target[this.#property] : this.#target)
  }
}

export class AttributeTracker extends Tracker {
  #node
  #name

  constructor (node, name, cfg, parent) {
    super(cfg, parent)
    this.#node = node
    this.#name = name
  }

  get node () {
    return this.#node
  }

  get name () {
    return this.#name
  }

  reconcile () {
    const { value } = this

    if (this.#node.matches('[type="checkbox"]') && this.#name === 'checked') {
      return ((this.#node.checked && !value) || (!this.#node.checked && !!value)) && this.#node.click()
    }

    if (typeof value === 'boolean') {
      return value ? this.#node.setAttribute(this.#name, '') : this.#node.removeAttribute(this.#name)
    }

    this.#node.setAttribute(this.#name, value)
  }
}

export class AttributeListTracker extends AttributeTracker {
  #currentValue

  constructor () {
    super(...arguments)
    this.#currentValue = this.value
  }

  reconcile () {
    const { name, node, value } = this

    if (name === 'class') {
      this.#currentValue ? node.classList.replace(this.#currentValue, value) : node.classList.add(value)
    } else {
      this.#currentValue ? node.setAttribute(name, node.getAttribute(name).replace(this.#currentValue, value)) : node.setAttribute(name, `${node.getAttribute(name)} ${value}`)
    }

    this.#currentValue = value
  }
}

export class BooleanAttributeListTracker extends AttributeTracker {
  #attribute

  constructor (node, name, attribute, cfg, parent) {
    super(node, name, cfg, parent)
    this.#attribute = attribute
  }

  reconcile () {
    const { value } = this
    
    if (this.name === 'class') {
      return value ? this.node.classList.add(this.#attribute) : this.node.classList.remove(this.#attribute)      
    }

    const current = this.node.getAttribute(this.name)
    this.node.setAttribute(this.name, value ? `${current} ${this.#attribute}` : current.replace(this.#attribute, ''))
  }
}

export class ContentTracker extends Tracker {
  #placeholder
  nodes
  #retainFormatting
  #currentValue

  constructor () {
    super(...arguments)
    // this.#currentValue = this.value
  }

  get placeholder () {
    return this.#placeholder
  }

  reconcile (path, baseURL) {
    // const { value } = this

    const { nodes, remaining } = this.getNodes(this.value, path, baseURL)
    this.replaceWith(nodes)

    return remaining

    // if (!this.#currentValue || [this.#currentValue, value].every(item => item instanceof Template)) {
    //   return this.replaceWith(this.getNodes(value))
    // }

    // this.nodes = reconcileNodes(this.nodes, this.getNodes(value))
  }

  render (node, retainFormatting, path, baseURL) {
    this.#placeholder = node
    this.nodes = [node]
    this.#retainFormatting = shouldRetainFormatting(retainFormatting, node)
    return this.reconcile(path, baseURL)
  }

  getNodes (value, path, baseURL) {
    if (Array.isArray(value)) {
      const nodes = []

      for (let item of value) {
        const output = this.getNodes(item)
        nodes.push(...output)
      }

      return { nodes, remaining: path }
    }

    if (value instanceof Template) {
      const renderer = new Renderer(this.parent, this.#retainFormatting)
      const tasks = []
      const { content, remaining } = renderer.render(value, path, baseURL, tasks)
      tasks.forEach(task => task())
      return {
        nodes: [...content.children],
        remaining
      }
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': 
        value !== false ? `${value}` : ''
        return {
          nodes: [document.createTextNode(this.#retainFormatting ? value : sanitizeString(value))],
          remaining: path
        }
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]

      default: throw new TypeError(`Invalid tracker value type "${typeof value}"`)
    }
  }

  replaceWith (nodes) {
    for (let i = 1, { length } = this.nodes; i < length; i++) {
      this.nodes[i].remove()
    }
    
    this.nodes.at(0).replaceWith(...nodes)
    this.nodes = nodes
  }
}