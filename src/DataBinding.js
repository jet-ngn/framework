import DataBindingInterpolation from './DataBindingInterpolation'
import Template from './Template'
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
    const newValue = this.transform(...this.targets)

    this.#value = {
      previous: Array.isArray(this.#value.current) ? [...this.#value.current] : this.#value.current,
      current: Array.isArray(newValue) ? [...newValue] : newValue
    }

    const { previous, current } = this.value
    return current !== previous
  }
}

export class AttributeBinding extends DataBinding {
  #name
  #node

  constructor (parent, node, name, interpolation) {
    super(parent, interpolation)
    this.#name = name
    this.#node = node
  }

  reconcile () {
    const cont = super.reconcile()

    if (!cont) {
      return
    }

    let { current } = this.value

    if (Array.isArray(current)) {
      const list = new AttributeList(this.parent, this.#node, this.#name, current)
      current = list.value
    }
    
    if (typeof current !== 'boolean') {
      return this.#node.setAttribute(this.#name, current)
    }

    if (!current) {
      return this.#node.removeAttribute(this.#name)
    }

    this.#node.setAttribute(this.#name, '')
  }
}

export class AttributeListBinding extends DataBinding {
  #list

  constructor (parent, list, interpolation) {
    super(parent, interpolation)
    this.#list = list
  }

  get initialValue () {
    super.reconcile()
    return this.value.current
  }

  reconcile () {
    super.reconcile() && this.#list.reconcile(this.value)
  }
}

export class AttributeListBooleanBinding extends DataBinding {
  #list
  #name

  constructor (parent, list, name, interpolation) {
    super(parent, interpolation)
    this.#list = list
    this.#name = name
  }

  get initialValue () {
    super.reconcile()
    return this.value.current
  }

  reconcile () {
    super.reconcile() && this.#list[this.value.current === true ? 'add' : 'remove'](this.#name)
  }
}

export class ContentBinding extends DataBinding {
  #children = []
  #nodes
  #placeholder
  #renderTemplate
  #retainFormatting

  constructor (parent, node, interpolation, retainFormatting, renderTemplate) {
    super(parent, interpolation)
    this.#placeholder = node
    this.#nodes = [node]
    this.#renderTemplate = renderTemplate
    this.#retainFormatting = retainFormatting
  }

  reconcile () {
    const cont = super.reconcile()
    
    if (!cont) {
      return
    }

    const { previous, current } = this.value
    const update = this.#getNodes(current)

    if (!previous || [previous, current].every(item => item instanceof Template)) {
      this.#replace(update)
    } else {
      if (update.length === 0) {
        this.#replace([this.#placeholder])
      } else {
        this.#nodes = reconcileNodes(this.#nodes, update)
      }
    }

    // if (this.#initialized) {
    //   this.#children.forEach(mount)
    // } else {
    //   this.#initialized = true
    // }

    return this.#children
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      return value.reduce((result, item) => [...result, ...this.#getNodes(item)], [])
    }

    if (value instanceof Template) {
      const fragment = this.#renderTemplate(this.parent, value, true)
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
    
    if (nodes.length > 0) {
      this.#nodes.at(0).replaceWith(...nodes)
      this.#nodes = nodes
    }
  }
}

export class PropertyBinding extends DataBinding {
  #name
  #node

  constructor (parent, node, name, interpolation) {
    super(parent, interpolation)
    this.#name = name
    this.#node = node
  }

  reconcile () {
    const cont = super.reconcile()

    if (cont) {
      this.#node[this.#name] = this.value.current
    }
  }
}

export class ViewBinding extends DataBinding {
  #children = []
  #node
  #view

  constructor (parent, node, interpolation) {
    super(parent, interpolation)
    this.#node = node
  }

  reconcile () {
    console.log('REC CONTENT. REVISIT ME!')
    // const cont = super.reconcile()

    // if (!cont) {
    //   return
    // }

    // this.#children.forEach(unmount)
    // this.#view?.emit(INTERNAL_ACCESS_KEY, 'unmount')

    // const { current } = this.value
    // this.#view = new View(this.parent, this.#node, current)
    // const { children, fragment } = generateChildren(this.#view, current)

    // this.#children = children
    // this.#view.children.push(...children)
    // this.#node.replaceChildren(fragment)

    // children.forEach(mount)
    // this.#view.emit(INTERNAL_ACCESS_KEY, 'mount')
    // return children
  }
}