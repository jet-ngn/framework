import IdentifiableClass from '../IdentifiableClass'
import Renderer from '../Renderer'
import Template from '../Template'
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

  reconcile () {
    // const { value } = this
    this.replaceWith(this.getNodes(this.value))

    // if (!this.#currentValue || [this.#currentValue, value].every(item => item instanceof Template)) {
    //   return this.replaceWith(this.getNodes(value))
    // }

    // this.nodes = reconcileNodes(this.nodes, this.getNodes(value))
  }

  render (node, retainFormatting) {
    this.#placeholder = node
    this.nodes = [node]
    this.#retainFormatting = retainFormatting
    return this.reconcile()
  }

  getNodes (value) {
    if (Array.isArray(value)) {
      const nodes = []

      for (let item of value) {
        const output = this.getNodes(item)
        nodes.push(...output)
      }

      return nodes
    }

    if (value instanceof Template) {
      const renderer = new Renderer(this.parent, { retainFormatting: this.#retainFormatting })
      const content = renderer.render(value)

      return [...content.children]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': 
        value !== false ? `${value}` : ''
        return [document.createTextNode(this.#retainFormatting ? value : sanitizeString(value))]

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