import { forEachKey } from '../utilities/IteratorUtils.js'
import Node from '../Node.js'

export function attachReferenceManager (target, cfg) {
  const getters = {}

  forEachKey(cfg, (name, selector) => {
    selector = selector.trim()

    Object.defineProperty(getters, name, {
      get: () => {
        const refs = [...target.root.querySelectorAll(selector.startsWith('>') ? `:scope ${selector}` : selector)].map(node => new Node(node))
        return refs.length === 1 ? refs[0] : refs
      }
    })
  })

  Object.defineProperty(target, 'references', {
    get: () => getters
  })
}