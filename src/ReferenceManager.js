import { forEachKey } from './utilities.js.js'
import ElementNode from './ElementNode.js'

// TODO: Add rendering functionality
// class Reference extends ElementNode {
//   #context
//   #name

//   constructor (context, name) {
//     this.#context = context
//     this.#name = name
//   }

//   get name () {
//     return this.#name
//   }
// }

// class SelectorReference {
//   #selector

//   constructor (context, name, selector) {
//     this.#selector = selector
//   }

//   get selector () {
//     return this.#selector
//   }
// }

const ReferenceManager = (context, root, references = {}) => {
  const getters = {}

  forEachKey(references, (name, selector) => {
    selector = selector.trim()

    if (selector.startsWith('>')) {
      selector = `:scope ${selector}`
    }

    Object.defineProperty(getters, name, {
      get () {
        const nodes = root.querySelectorAll(selector)
        return (Array.isArray(nodes) ? nodes : [nodes]).map(node => new ElementNode(node))
      }
    })
  })

  return {
    references: getters
  }
}

export { ReferenceManager as default }