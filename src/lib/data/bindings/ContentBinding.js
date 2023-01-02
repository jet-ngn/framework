import DataBinding from './DataBinding'
import Template from '../../rendering/Template'
// import { getTemplateRenderingTasks } from '../../rendering/Renderer'
import { reconcileNodes } from '../../rendering/Reconciler'
import { removeDOMEventsByNode } from '../../events/DOMBus'
import { sanitizeString } from '../../../utilities/StringUtils'

export default class ContentBinding extends DataBinding {
  // #children = []
  #nodes
  #placeholder
  #retainFormatting

  constructor (view, element, interpolation, { retainFormatting }) {
    super(view, interpolation)
    this.#placeholder = node
    this.#nodes = [element]
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

      if (current?.length === 0) {
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
    value = value ?? ''

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return []
      }

      return value.reduce((result, item) => [...result, ...this.#getNodes(item)], [])
    }

    if (value instanceof Template) {
      const fragment = document.createDocumentFragment()
      const template = document.createElement('template')
      
      fragment.append(template)

      const tree = {}
      
      const tasks = getTemplateRenderingTasks({
        view: this.view,
        template: value,
        placeholder: template,
        tree
      })
      
      tasks.forEach(({ callback }) => callback())

      return [...fragment.children]
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