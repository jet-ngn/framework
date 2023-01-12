import BaseContentBinding from './BaseContentBinding'

import HTMLTemplate from '../../rendering/HTMLTemplate'
import SVGTemplate from '../../rendering/SVGTemplate'

import { getTemplateRenderingTasks } from '../../rendering/Renderer'
import { reconcileNodes } from '../../rendering/Reconciler'
import { sanitizeString } from '../../../utilities/StringUtils'

export default class ContentBinding extends BaseContentBinding {
  * getReconciliationTasks (init = false) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { current }) {
    if (current === null || current?.length === 0) {
      return yield [`Replace nodes`, ({ next }) => {
        this.replace([this.placeholder])
        next()
      }]
    }

    // TODO: Support svg
    if (current instanceof HTMLTemplate) {
      const template = document.createElement('template')
      
      yield * getTemplateRenderingTasks(this.app, this.view, current, template, this.childViews, this.routers, null)

      // TODO: Try reconciling instead of always replacing?
      return yield [`Reconcile template`, ({ next }) => {
        this.replace([...template.childNodes])
        next()
      }]

    } else if (current instanceof SVGTemplate) {
      throw new Error(`SVG is currently not supported in Content Bindings`)
    }

    yield [`${init ? `Initialize` : `Reconcile`} Content Binding`, ({ next }) => {
      this.nodes = reconcileNodes(this.nodes, this.#getUpdate(arguments[1]))
      next()
    }]
  }

  #getUpdate ({ current }) {
    switch (typeof current) {
      case 'string':
      case 'number':
      case 'boolean':
        const value = current !== false ? `${current}` : ''  
        return [document.createTextNode(this.retainFormatting ? sanitizeString(value) : value)]
      
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]
  
      default: throw new TypeError(`Invalid binding value type "${typeof current}"`)
    }
  }
}

// export default class ContentBinding extends DataBinding {
//   #childViews
//   #nodes
//   #placeholder
//   #retainFormatting
//   #routers

//   constructor (app, view, interpolation, element, childViews, routers, { retainFormatting }) {
//     super(app, view, interpolation)
//     this.#childViews = childViews
//     this.#placeholder = element
//     this.#nodes = [element]
//     this.#retainFormatting = retainFormatting
//     this.#routers = routers
//   }

//   reconcile (method) {
//     super.reconcile(({ previous, current }) => {
//       if (!!method && this.proxies.size === 1 && Array.isArray([...this.proxies][0][0])) {
//         switch (method) {
//           case 'push': return this.#push(previous, current)
//           case 'pop': return this.#pop()
//           case 'shift': return this.#shift()
//           case 'unshift': return this.#unshift(previous)
//           default: break
//         }
//       }

//       if (current?.length === 0) {
//         return this.#replace([this.#placeholder])
//       }

//       const update = this.#getNodes(current)

//       if (!previous || [previous, current].every(item => item instanceof Template)) {
//         return this.#replace(update)
//       }

//       this.#nodes = reconcileNodes(this.#nodes, update)
//     })
//   }

//   #getNodes (value) {
//     value = value ?? ''

//     if (Array.isArray(value)) {
//       if (value.length === 0) {
//         return []
//       }

//       const result = []

//       for (const item of value) {
//         result.push(...this.#getNodes(item))
//       }

//       return result
//     }

//     if (value instanceof Template) {
//       const template = document.createElement('template')

//       runTasks(getTemplateRenderingTasks(this.app, this.view, value, template, this.#childViews, this.#routers), {
//         app: this.app,
//         view: this.view,
//         childViews: this.#childViews,
//         routers: this.#routers
//       })

//       return [...template.children]
//     }

//     switch (typeof value) {
//       case 'string':
//       case 'number':
//       case 'boolean':
//         value = value !== false ? `${value}` : ''  
//         return [document.createTextNode(this.#retainFormatting ? sanitizeString(value) : value)]
      
//       // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]

//       default: throw new TypeError(`Invalid binding value type "${typeof value}"`)
//     }
//   }

//   #replace (nodes) {
//     for (let i = 1, { length } = this.#nodes; i < length; i++) {
//       const node = this.#nodes[i]
//       removeDOMEventsByNode(node)
//       node.remove()
//     }
    
//     if (nodes.length > 0) {
//       this.#nodes.at(0).replaceWith(...nodes)
//       this.#nodes = nodes
//     }
//   }

//   #pop () {
//     const last = this.#nodes.at(-1)
//     // const { unmount } = ViewRegistry.getEntryByNode(last) ?? {}
    
//     // if (unmount) {
//     //   unmount()
//     // }

//     last.remove()
//     removeDOMEventsByNode(this.#nodes.pop())
//   }

//   #push (previous, current) {
//     let newNodes = this.#getNodes(current.slice((current.length - previous.length) * -1))
//     const last = this.#nodes.at(-1)

//     if (!last || last === this.#placeholder) {
//       this.#placeholder.replaceWith(...newNodes)
//       this.#nodes = newNodes
//     } else {
//       last.after(...newNodes)
//       this.#nodes.push(...newNodes)
//     }

//     newNodes = []
//   }

//   #shift () {
//     const first = this.#nodes.at(0)
//     // const { unmount } = ViewRegistry.getEntryByNode(first) ?? {}
    
//     // if (unmount) {
//     //   unmount()
//     // }

//     first.remove()
//     removeDOMEventsByNode(this.#nodes.shift())
//   }

//   #unshift (...args) {
//     let newNodes = this.#getNodes(this.value.slice(0, args.length))
//     const first = this.#nodes[0]

//     if (!first || first === this.#placeholder) {
//       this.#placeholder.replaceWith(...newNodes)
//       this.#nodes = newNodes
//     } else {
//       first.before(...newNodes)
//       this.#nodes.unshift(...newNodes)
//     }
//   }
// }