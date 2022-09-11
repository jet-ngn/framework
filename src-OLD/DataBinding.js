import DataBindingInterpolation from './DataBindingInterpolation'
import { INTERNAL_ACCESS_KEY } from './env'
import { removeDOMEventsByNode } from './registries/DOMEventRegistry'
import Template from './Template'
import { reconcileNodes } from './utilities/ReconcileUtils'
import { sanitizeString } from './utilities/StringUtils'

class DataBinding extends DataBindingInterpolation {
  #parent
  #value = null

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

  reconcile (cb) {
    const previous = this.#value
    let newValue = this.transform(...this.targets)
    newValue = Array.isArray(newValue) ? [...newValue] : newValue

    if (newValue !== this.#value) {
      this.#value = newValue

      cb && cb({
        previous,
        current: this.#value
      })
    }
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
    super.reconcile(({ current }) => {
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
    })
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
    return this.value
  }

  reconcile () {
    super.reconcile(value => this.#list.reconcile(value))
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
    return this.value
  }

  reconcile () {
    super.reconcile(({ current }) => this.#list[current === true ? 'add' : 'remove'](this.#name))
  }
}

export class ContentBinding extends DataBinding {
  // #children = []
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

  reconcile (method) {
    super.reconcile(({ previous, current }) => {
      if (!!method && this.targets.length === 1 && Array.isArray(this.targets[0])) {
        switch (method) {
          case 'push': return this.#push(previous, current)
          case 'pop': return this.#pop()
          case 'shift': return this.#shift()
          case 'unshift': return this.#unshift(previous)
          default: break
        }
      }

      if (current.length === 0) {
        return this.#replace([this.#placeholder])
      }

      const update = this.#getNodes(current)

      if (!previous || [previous, current].every(item => item instanceof Template)) {
        return this.#replace(update)
      }

      this.#nodes = reconcileNodes(this.#nodes, update)
    })
  }

  #getNodes (value) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return []
      }

      return value.reduce((result, item) => [...result, ...this.#getNodes(item)], [])
    }

    if (value instanceof Template) {
      return [...this.#renderTemplate(this.parent, value, true).children]
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
      const node = this.#nodes[i]
      removeDOMEventsByNode(node)
      node.remove()
    }
    
    if (nodes.length > 0) {
      this.#nodes.at(0).replaceWith(...nodes)
      this.#nodes = nodes
    }
  }

  #pop () {
    const last = this.#nodes.at(-1)
    // const { unmount } = ViewRegistry.getEntryByNode(last) ?? {}
    
    // if (unmount) {
    //   unmount()
    // }

    last.remove()
    removeDOMEventsByNode(this.#nodes.pop())
  }

  #push (previous, current) {
    let newNodes = this.#getNodes(current.slice((current.length - previous.length) * -1))
    const last = this.#nodes.at(-1)

    if (!last || last === this.#placeholder) {
      this.#placeholder.replaceWith(...newNodes)
      this.#nodes = newNodes
    } else {
      last.after(...newNodes)
      this.#nodes.push(...newNodes)
    }

    newNodes = []
  }

  #shift () {
    const first = this.#nodes.at(0)
    // const { unmount } = ViewRegistry.getEntryByNode(first) ?? {}
    
    // if (unmount) {
    //   unmount()
    // }

    first.remove()
    removeDOMEventsByNode(this.#nodes.shift())
  }

  #unshift (...args) {
    let newNodes = this.#getNodes(this.value.slice(0, args.length))
    const first = this.#nodes[0]

    if (!first || first === this.#placeholder) {
      this.#placeholder.replaceWith(...newNodes)
      this.#nodes = newNodes
    } else {
      first.before(...newNodes)
      this.#nodes.unshift(...newNodes)
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
    super.reconcile(({ current }) => this.#node[this.#name] = current)
  }
}

export class ViewBinding extends DataBinding {
  #node
  #view
  #viewConstructor
  #mount
  #unmount
  #generateTree

  constructor (parent, node, interpolation, viewConstructor, mount, unmount, generateTree) {
    super(parent, interpolation)
    this.#node = node
    this.#viewConstructor = viewConstructor
    this.#mount = mount
    this.#unmount = unmount
    this.#generateTree = generateTree
  }

  reconcile () {
    super.reconcile(({ current }) => {
      const { children } = this.parent

      if (this.#view) {
        children.splice(children.indexOf(this.#view), 1)
        this.#unmount(this.#view)
      }

      if (!current) {
        return
      }
      
      this.#view = new this.#viewConstructor(this.parent, this.#node, current)
      children.push(this.#view)
      console.log('BEFORE MOUNT ', this.#view.name);
      let abort = false

      this.#view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
        abort: () => {
          console.log('ABORT MOUNTING ', this.#view.name)
          abort = true
        }
      })

      if (abort) {
        return console.log('ABORTED ', this.#view.name);
      }

      this.#node.replaceChildren(this.#generateTree(this.#view, current))
      this.#mount(this.#view)
    })
  }
}