import DataBinding from './DataBinding'
import Template from '../../parser/templates/Template'
import StateObject from '../StateObject'
import StateArray from '../StateArray'

import { getTemplateRenderingTasks } from '../../renderer/Renderer'
import { reconcileNodes } from '../../renderer/Reconciler'
import { removeDOMEventsByNode } from '../../events/DOMBus'
import { html } from '../../parser/tags'
import { sanitizeString } from '../../utilities/strings'
import { runTasks } from '../../lib/TaskRunner'

import { logBindings, removeBinding, removeState, removeStateByProxy } from '../DataRegistry'

// TODO: Refactor with handleReconciliation function that runs whatever tasks are
// necessary, then fires this.callback. That will remove all the dupicate this.callback calls.

export default class ContentBinding extends DataBinding {
  #children = []
  #childViews
  #placeholder
  #retainFormatting
  #routers
  #nodes
  #parent

  constructor ({ app, parent, view, element, interpolation, childViews, routers, options = {} } = {}) {
    super(app, view, interpolation)
    this.#childViews = childViews
    this.#placeholder = element
    this.#retainFormatting = options.retainFormatting ?? false
    this.#routers = routers
    this.#nodes = [element]
    this.#parent = parent ?? null
  }

  get children () {
    return this.#children
  }

  get hasChildren () {
    return this.#children.length > 0
  }

  get nodes () {
    return this.#nodes
  }

  get parent () {
    return this.#parent
  }

  addChildBinding (binding, { mode }) {
    switch (mode) {
      case 'prepend': return this.#children.unshift(binding)
      case 'append': return this.#children.push(binding)
    }
  }

  async reconcile (init = false, method) {
    const change = super.reconcile(init)

    let { previous, current } = change

    if (Array.isArray(current)) {
      return this.state instanceof StateObject
        ? this.#reconcileStateObjectArray(change, method)
        : this.#reconcileStateArray(change, method)
    }

    if (!current) {
      if (!previous) {
        return
      }

      this.#removeChildBindings()
      return requestAnimationFrame(() => this.#replaceNodes())
    }

    if (!(current instanceof Template)) {
      current = html`${current}`
    }

    if (!previous) {
      return this.#renderTemplates([current], element => {
        requestAnimationFrame(() => this.#replaceNodes([...element.childNodes]))
      })
    }

    if (this.hasChildren) {
      this.#removeChildBindings(true)
      this.state.removeChildProxies()
    }

    this.#renderTemplates([current], element => {
      const nodes = [...element.childNodes]

      if (this.hasChildren) {
        return requestAnimationFrame(() => {
          this.#replaceNodes(nodes)
          console.log('*****');
          logBindings()
        })
      }

      this.#nodes = reconcileNodes(this.#nodes, nodes)
    })
  }

  #getArrayMethodHandler ({ previous, current }, method) {
    switch (method) {
      case 'unshift': return () => {
        this.#renderTemplates(previous.length === 0 ? current : current.slice(0, -previous.length), element => {
          const first = this.#nodes[0]
          const nodes = [...element.childNodes]
    
          if (!first || first === this.#placeholder) {
            return this.#replaceNodes(nodes)
          }
    
          first.before(...nodes)
          this.#nodes.unshift(...nodes)
        }, { mode: 'prepend' })
      }

      case 'push': return () => {
        this.#renderTemplates(current.slice((current.length - previous.length) * -1), element => {
          const last = this.#nodes.at(-1)
          const nodes = [...element.childNodes]
    
          if (!last || last === this.#placeholder) {
            return this.#replaceNodes(nodes)
          }
    
          last.after(...nodes)
          this.#nodes.push(...nodes)
        }, { mode: 'append' })
      }

      case 'pop': return () => {
        if (this.#nodes.length === 1) {
          if (this.#nodes[0] === this.#placeholder) {
            return logBindings()
          }

          this.#removeChild(this.#children.pop())
          this.#replaceNodes()
          return logBindings()
        }

        const lastNode = this.#nodes.pop()
        removeDOMEventsByNode(lastNode)
        lastNode.remove()
        this.#removeChild(this.#children.pop())
        logBindings()
      }

      case 'reverse': return () => {
        console.log('HELLO');
        this.#children.reverse()

        for (const [index, node] of this.#nodes.reverse().entries()) {
          this.#nodes.at(-index).before(node)
        }

        console.log(this)
      }

      case 'shift': return () => {
        if (this.#nodes.length === 1) {
          if (this.#nodes[0] === this.#placeholder) {
            return
          }

          this.#removeChild(this.#children.shift())
          return this.#replaceNodes()
        }

        const firstNode = this.#nodes.shift()
        removeDOMEventsByNode(firstNode)
        firstNode.remove()
        this.#removeChild(this.#children.shift())
      }

      default: throw new ReferenceError(`Array method "${method}" not recognized`)
    }
  }

  * #getTemplateRenderingTasks (templates, element, options = {}) {
    for (let template of templates) {
      yield * getTemplateRenderingTasks({
        app: this.app,
        binding: this,
        view: this.view,
        element,
        template: template instanceof Template ? template : html`${template}`,
        childViews: this.#childViews,
        routers: this.#routers,
        options: { append: true, ...options }
      })
    }
  }

  #handleUpdate (handler) {
    handler()
    this.callback && this.callback({ nodes: this.#nodes })
  }

  #reconcileStateArray ({ previous, current }, method) {
    if (method && Array.isArray(previous)) {
      return this.#handleUpdate(this.#getArrayMethodHandler(...arguments))
    }

    console.log('RENDER ME TIMBERS', method);
    // this.#removeChildBindings()

    this.#renderTemplates([current], element => {
      this.#replaceNodes([...element.childNodes])
      this.callback && this.callback({ nodes: this.#nodes })
      logBindings()
    })
  }

  #reconcileStateObjectArray ({ previous, current }, method) {
    // <ul>
    //   ${bind(state, 'arr', items => items.map(({ name, properties }) => html`
    //     <li>${name}, <span>${bind(properties, 'age')}</span></li>
    //   `))}
    // </ul>

    // Produces:
    // <ul>
    //   <li>Person 1 Name, ${bind(state.arr[0].properties, 'age')}</li>
    //   <li>Person 2 Name, ${bind(state.arr[1].properties, 'age')}</li>
    //   <li>Person 3 Name, ${bind(state.arr[2].properties, 'age')}</li>
    // </ul>

    // Each li is stored in this.#nodes, to which array methods are applied. Then, 
    // DOM is updated using code similar to this:
    
    // const frag = document.createDocumentFragment();
    // const list = document.querySelector("ul");
    // const items = list.querySelectorAll("li");
    // const sortedList = Array.from(items).sort(function(a, b) {
    //   const c = a.textContent,
    //     d = b.textContent;
    //   return c < d ? -1 : c > d ? 1 : 0;
    // });
    // for (let item of sortedList) {
    //   frag.appendChild(item);
    // }
    // list.appendChild(frag);
  }

  #removeChildBindings (removeStates = false) {
    this.#children.forEach(child => {
      removeStates && removeState(child.state)
      this.state.removeBinding(child)
    })

    this.#children = []
  }

  #removeChild (child) {
    this.state.removeChildProxy(child.state.proxy)
    this.state.removeBinding(child)
  }

  // #removeChildren () {
  //   for (const child of this.#children) {
  //     this.#removeChild(child)  
  //   }
  // }

  #renderTemplates (templates = [], callback, options = null) {
    const element = document.createElement('template')
    
    runTasks(this.#getTemplateRenderingTasks(templates, element, options), { callback: () => {
      callback(element)
    } })
  }

  #replaceNodes (nodes = []) {
    for (let i = 1, { length } = this.#nodes; i < length; i++) {
      const node = this.#nodes[i]
      removeDOMEventsByNode(node)
      node.remove()
    }

    const firstNode = this.#nodes.at(0)
    removeDOMEventsByNode(firstNode)
    
    if (nodes.length === 0) {
      nodes = [this.#placeholder]
    }

    firstNode.replaceWith(...nodes)
    this.#nodes = nodes

    // this.callback && this.callback({ nodes: this.#nodes })
  }
}
