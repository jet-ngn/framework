import Template from './Template.js'
import Renderer from './Renderer.js'
import { NANOID } from '@ngnjs/libdata'
import { getOptions } from './Renderer.js'
import { reconcileNodes } from './Reconciler.js'
import { sanitizeString } from './utilities/StringUtils.js'
import ViewRegistry from './ViewRegistry.js'

class Tracker {
  #id = NANOID()
  #parent
  #target
  #property
  #transform

  constructor ({ target, property, transform }, parent) {
    this.#parent = parent
    this.#target = target
    this.#property = property
    this.#transform = transform
  }

  get id () {
    return this.#id
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

    if (typeof value === 'boolean') {
      return value ? this.#node.setAttribute(this.#name, '') : this.#node.removeAttribute(this.#name)
    }

    this.#node.setAttribute(this.#name, typeof value === 'boolean' ? '' : value)
  }
}

export class AttributeListTracker extends AttributeTracker {
  #currentValue

  constructor () {
    super(...arguments)
    this.#currentValue = this.value
  }

  reconcile () {
    const { value } = this

    if (this.name === 'class') {
      this.node.classList.replace(this.#currentValue, value)      
    } else {
      this.node.setAttribute(this.name, this.node.getAttribute(this.name).replace(this.#currentValue, value))
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

export class BindingTracker extends Tracker {
  #node
  #listeners
  #route

  constructor (node, cfg, parent = null, options = null) {
    super(cfg, parent)
    this.#node = node
    this.#listeners = options?.boundListeners ?? null
    this.#route = options?.route ?? null
  }

  reconcile () {
    let current = ViewRegistry.getEntryByNode(this.#node)

    current.unmount()
    this.#listeners?.unmount && this.#listeners.unmount.call(current.view)
    
    let next = ViewRegistry.register({
      parent: this.parent,
      root: this.#node,
      config: this.value
    })

    next.mount()
    this.#listeners?.mount && this.#listeners.mount.call(next.view)
  }
}

export class ContentTracker extends Tracker {
  #placeholder
  nodes
  #options
  #currentValue

  constructor () {
    super(...arguments)
    // this.#currentValue = this.value
  }

  get placeholder () {
    return this.#placeholder
  }

  reconcile () {
    const { value } = this

    if (!this.#currentValue || [this.#currentValue, value].every(item => item instanceof Template)) {
      return this.replaceWith(this.getNodes(value))
    }

    this.nodes = reconcileNodes(this.nodes, this.getNodes(value))
  }

  render (node, options) {
    this.#placeholder = node
    this.nodes = [node]
    this.#options = getOptions(options, node)
    this.reconcile()
  }

  getNodes (value) {
    if (Array.isArray(value)) {
      const result = []

      for (let item of value) {
        const output = this.getNodes(item)
        result.push(...output)
      }

      return result
    }

    if (value instanceof Template) {
      console.log('CHILD IS TEMPLATE. CHECK CODE!');
      const renderer = new Renderer(this.parent, this.#options)
      const content = renderer.render(value, [], true)
      // this.parent.children.forEach(child => ViewRegistry.mount(child.id))
      // tasks.forEach(task => task())
      return [...content.children]
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean': return [document.createTextNode(sanitizeString(value !== false ? `${value}` : '', this.#options))]
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

export class ArrayContentTracker extends ContentTracker {
  pop () {
    const last = this.nodes.at(-1)
    const { unmount } = ViewRegistry.getEntryByNode(last) ?? {}
    
    if (unmount) {
      unmount()
    }

    last.remove()
    this.nodes.pop()
  }

  push (...args) {
    const newNodes = this.getNodes(this.value.slice(args.length * -1))
    const last = this.nodes.at(-1)

    if (!last || last === this.placeholder) {
      this.placeholder.replaceWith(...newNodes)
      this.nodes = newNodes
    } else {
      last.after(...newNodes)
      this.nodes.push(...newNodes)
    }
  }

  reconcile () {
    if (this.value.length === 0) {
      return this.replaceWith([this.placeholder])
    }

    super.reconcile()
  }

  shift () {
    const first = this.nodes[0]
    const { unmount } = ViewRegistry.getEntryByNode(first) ?? {}
    
    if (unmount) {
      unmount()
    }

    first.remove()
    this.nodes.shift()
  }

  unshift (...args) {
    const newNodes = this.getNodes(this.value.slice(0, args.length))
    const first = this.nodes[0]

    if (!first || first === this.placeholder) {
      this.placeholder.replaceWith(...newNodes)
      this.nodes = newNodes
    } else {
      first.before(...newNodes)
      this.nodes.unshift(...newNodes)
    }
  }
}