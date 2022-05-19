import DataBindingInterpolation from './DataBindingInterpolation'
import Template from './Template'
import { mount, parseTemplate, unmount } from './utilities/RenderUtils'
import { reconcileNodes } from './utilities/ReconcileUtils'
import { sanitizeString } from './utilities/StringUtils'

class DataBinding extends DataBindingInterpolation {
  #parent
  
  #value = {
    previous: null,
    current: null
  }

  constructor (parent, { targets, transform }) {
    super(targets, transform)
    this.#parent = parent
  }

  get parent () {
    return this.#parent
  }

  get value () {
    return this.#value
  }

  reconcile () {
    this.#value = {
      previous: this.#value.current,
      current: this.transform(...this.targets)
    }
  }
}

export class ContentBinding extends DataBinding {
  #children = []
  #initialized = false
  #nodes
  #retainFormatting

  constructor (parent, node, interpolation, retainFormatting) {
    super(parent, interpolation)
    this.#nodes = [node]
    this.#retainFormatting = retainFormatting
  }

  reconcile () {
    super.reconcile()
    
    const { previous, current } = this.value
    const update = this.#getNodes(current)

    if (!previous || [previous, current].every(item => item instanceof Template)) {
      this.#replace(update)
    } else {
      this.#nodes = reconcileNodes(this.#nodes, update)
    }

    if (this.#initialized) {
      this.#children.forEach(mount)
    } else {
      this.#initialized = true
    }

    return this.#children
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      return current.map(item => this.#getNodes(item))
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

      default: throw new TypeError(`Invalid binding value type "${typeof value}"`)
    }
  }

  #replace (nodes) {
    for (let i = 1, { length } = this.#nodes; i < length; i++) {
      this.#nodes[i].remove()
    }
    
    this.#nodes.at(0).replaceWith(...nodes)
    this.#nodes = nodes
  }
}