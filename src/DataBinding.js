import Template from './Template'
import { mount, parseTemplate, unmount } from './utilities/RenderUtils'
import { reconcileNodes } from './utilities/ReconcileUtils'
import { sanitizeString } from './utilities/StringUtils'

class DataBinding {
  #targets
  #properties
  #transform
  #previousValue
  #value
  #parent

  constructor (parent, { targets, properties, transform }) {
    this.#parent = parent
    this.#targets = targets
    this.#properties = properties
    this.#transform = transform
  }

  get parent () {
    return this.#parent
  }

  get properties () {
    return this.#properties
  }

  get targets () {
    return this.#targets
  }

  get previousValue () {
    return this.#previousValue
  }

  get value () {
    return this.#value
  }

  render () {
    this.#previousValue = this.#value
    this.#value = this.#getValue()
  }

  #getValue () {
    if (this.#targets.length > 1) {
      if (this.#properties.length > 0) {
        throw new Error(`Invalid Data Binding: Bindings with multiple targets cannot have properties`)
      }

      return this.#transform(...this.#targets)
    }

    const target = this.#targets[0]

    if (this.#properties.length > 1) {
      return this.#transform(...this.#properties.map(property => target[property]))
    }

    if (this.#properties.length === 1) {
      return this.#transform(target[this.#properties[0]])
    }

    return this.#transform(target)
  }
}

export class ContentBinding extends DataBinding {
  #children = []
  #nodes
  #placeholder
  #retainFormatting
  #shouldMountChildren = false
  
  constructor (parent, placeholder, config, retainFormatting) {
    super(parent, config)
    this.#nodes = [placeholder]
    this.#placeholder = placeholder
    this.#retainFormatting = retainFormatting
  }
  
  render () {
    super.render()

    const { previousValue, value } = this

    if (!previousValue || [previousValue, value].every(item => item instanceof Template)) {
      this.#replaceWith(this.#getNodes(value))
    } else {
      this.#nodes = reconcileNodes(this.#nodes, this.#getNodes(value))
    }

    this.#shouldMountChildren && this.#children.forEach(mount)

    if (!this.#shouldMountChildren) {
      this.#shouldMountChildren = true
    }
  }

  #replaceWith (nodes) {
    for (let i = 1, { length } = this.#nodes; i < length; i++) {
      this.#nodes[i].remove()
    }
    
    this.#nodes.at(0).replaceWith(...nodes)
    this.#nodes = nodes
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      const result = []

      for (let item of value) {
        const output = this.#getNodes(item)
        result.push(...output)
      }

      return result
    }

    if (value instanceof Template) {
      const { children, fragment } = parseTemplate(this.parent, value)
      
      this.#children.forEach(child => {
        unmount(child)
        this.parent.children.splice(this.parent.children.indexOf(child), 1)
      })

      this.parent.children.push(...children)
      this.#children = children

      return [...fragment.childNodes]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        value = value !== false ? `${value}` : ''  
        return [document.createTextNode(this.#retainFormatting ? sanitizeString(value) : value)]
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]

      default: throw new TypeError(`Invalid tracker value type "${typeof value}"`)
    }
  }
}