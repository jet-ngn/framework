import DataBindingInterpolation from './DataBindingInterpolation'
import Template from './Template'
import View from './View'
import { generateChildren, mount, parseTemplate, unmount } from './utilities/RenderUtils'
import { reconcileNodes } from './utilities/ReconcileUtils'
import { sanitizeString } from './utilities/StringUtils'
import { INTERNAL_ACCESS_KEY } from './env'
import AttributeList from './AttributeList'

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
  #initialized = false
  #nodes
  #retainFormatting

  constructor (parent, node, interpolation, retainFormatting) {
    super(parent, interpolation)
    this.#nodes = [node]
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
      this.#node[this.#name] = current
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
    const cont = super.reconcile()

    if (!cont) {
      return
    }

    this.#children.forEach(unmount)
    this.#view?.emit(INTERNAL_ACCESS_KEY, 'unmount')

    const { current } = this.value
    this.#view = new View(this.parent, this.#node, current)
    const { children, fragment } = generateChildren(this.#view, current)

    this.#children = children
    this.#view.children.push(...children)
    this.#node.replaceChildren(fragment)

    children.forEach(mount)
    this.#view.emit(INTERNAL_ACCESS_KEY, 'mount')
    return children
  }
}

// export class AttributeListBinding extends DataBinding {
//   #initialized = false
//   #list
//   #name
//   #node

//   constructor (parent, node, name, list, interpolation) {
//     super(parent, interpolation)
//     this.#list = list
//     this.#name = name
//     this.#node = node
//   }

//   render () {
//     console.log(this.#list.reduce((result, item) => {
//       if (item instanceof DataBindingInterpolation) {
//         result.push('WORKS')
//       }

//       return result
//     }, []));

//     return this.#list.reduce((result, item) => {
//       if (item instanceof DataBindingInterpolation) {
//         result.push('WORKS')
//       }

//       return result
//     }, [])
//   }

//   reconcile () {
//     const cont = super.reconcile()

//     if (!cont) {
//       return
//     }

//     const list = this.#getValue()
//     console.log(this.#list);
//     this.#node.setAttribute(this.#name, list.join(' '))
//     return list
//   }

//   #getValue () {
//     return this.#list.map(item => item instanceof DataBindingInterpolation ? 'WIP' : item)
//   }
// }