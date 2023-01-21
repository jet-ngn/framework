import DataBinding from './DataBinding'
import Template from '../../parsing/templates/Template'

import { getTemplateRenderingTasks } from '../../rendering/Renderer'
import { reconcileNodes } from '../../rendering/Reconciler'
import { removeDOMEventsByNode } from '../../events/DOMBus'
import { html } from '../../parsing/tags'
import { sanitizeString } from '../../utilities/StringUtils'
import { runTasks } from '../../TaskRunner'

// TODO: Refactor with handleReconciliation function that runs whatever tasks are
// necessary, then fires callback. That will remove all the dupicate callback calls.

export default class ContentBinding extends DataBinding {
  #childViews
  #placeholder
  #retainFormatting
  #routers
  #nodes

  constructor ({ app, view, element, interpolation, childViews, routers, options = {} } = {}) {
    super(app, view, interpolation)
    this.#childViews = childViews
    this.#placeholder = element
    this.#retainFormatting = options.retainFormatting ?? false
    this.#routers = routers
    this.#nodes = [element]
  }

  async reconcile (init = false, method) {
    const { previous, current } = super.reconcile(init)

    if (!current || current?.length === 0) {
      return !init && this.#replace([this.#placeholder])
    }

    if (!!method) {
      switch (method) {
        case 'push': return this.#push(previous, current)
        case 'pop': return this.#pop()
        case 'shift': return this.#shift()
        case 'unshift': return this.#unshift(previous)
        default: break
      }
    }
    
    if (current instanceof Template) {
      return this.#reconcileTemplates([current])
    }
    
    if (Array.isArray(current)) {
      return this.#reconcileTemplates(current)
    }
    
    let update = this.#getUpdate(current)
    
    if (update.length === 0) {
      return this.#replace([this.#placeholder])
    }
    
    if (init) {
      return this.#replace(update)
    }
    
    this.#nodes = reconcileNodes(this.#nodes, update)
    this.callback && this.callback({ nodes: this.#nodes })
  }

  * #getTemplateRenderingTasks (templates, element) {
    for (let template of templates) {
      if (!(template instanceof Template)) {
        template = html`${template}`
      }

      yield * getTemplateRenderingTasks({
        app: this.app,
        view: this.view,
        element,
        template,
        childViews: this.#childViews,
        routers: this.#routers,
        options: { append: true }
      })
    }
  }

  #getUpdate (value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean).reduce((result, entry) => [...result, ...this.#getUpdate(entry)], [])
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

  #reconcileTemplates (templates) {
    const element = document.createElement('template')

    runTasks(this.#getTemplateRenderingTasks(templates, element), {
      callback: () => {
        const { childNodes } = element
        // TODO: Look into reconciling instead of replacing
        this.#replace([...(childNodes.length > 0 ? childNodes : [this.#placeholder])])
      }
    })
  }

  #replace (nodes) {
    for (let i = 1, { length } = this.#nodes; i < length; i++) {
      const node = this.#nodes[i]
      removeDOMEventsByNode(node)
      node.remove()
    }

    const existingNode = this.#nodes.at(0)
    removeDOMEventsByNode(existingNode)

    existingNode.replaceWith(...nodes)
    this.#nodes = nodes
    this.callback && this.callback({ nodes: this.#nodes })
  }

  #pop () {
    if (this.#shouldRunArrayMethod()) {
      const last = this.#nodes.pop()

      if (last) {
        removeDOMEventsByNode(last)
        // removeViewByNode(this.childViews, last)
        last.remove()
      }
    }

    this.callback && this.callback({ nodes: this.#nodes })
  }

  #push (previous, current) {
    const templates = current.slice((current.length - previous.length) * -1)
    const element = document.createElement('template')

    runTasks(this.#getTemplateRenderingTasks(templates, element), {
      callback: () => {
        const last = this.#nodes.at(-1)
        const nodes = [...element.childNodes]
  
        if (!last || last === this.#placeholder) {
          this.#placeholder.replaceWith(...nodes)
          this.#nodes = nodes
        } else {
          last.after(...nodes)
          this.#nodes.push(...nodes)
        }

        this.callback && this.callback({ nodes: this.#nodes })
      }
    })
  }

  #shift () {
    if (this.#shouldRunArrayMethod()) {
      const first = this.#nodes.shift()

      if (first) {
        removeDOMEventsByNode(first)
        // removeViewByNode(this.childViews, first)
        first.remove()
      } 
    }

    this.callback && this.callback({ nodes: this.#nodes })
  }

  #shouldRunArrayMethod () {
    if (this.#nodes.length > 1) {
      return true      
    }
    
    if (this.#nodes.at(0) !== this.#placeholder) {
      this.#replace([this.#placeholder])
    }
    console.log(this.#nodes)
    return false
  }

  #unshift (...args) {
    const templates = this.value.slice(0, args.length)
    const element = document.createElement('template')

    runTasks(this.#getTemplateRenderingTasks(templates, element), {
      callback: () => {
        const first = this.#nodes[0]
        const nodes = [...element.childNodes]

        if (!first || first === this.#placeholder) {
          this.#placeholder.replaceWith(...nodes)
          this.#nodes = nodes
        } else {
          first.before(...nodes)
          this.#nodes.unshift(...nodes)
        }

        this.callback && this.callback({ nodes: this.#nodes })
      }
    })
  }
}
