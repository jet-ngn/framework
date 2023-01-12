import DataBinding from './DataBinding'
import { removeDOMEventsByNode } from '../../events/DOMBus'

export default class BaseContentBinding extends DataBinding {
  #childViews
  #placeholder
  #retainFormatting
  #routers

  nodes

  constructor (app, view, interpolation, element, childViews, routers, { retainFormatting }) {
    super(app, view, interpolation)
    this.#childViews = childViews
    this.#placeholder = element
    this.#retainFormatting = retainFormatting
    this.#routers = routers

    this.nodes = [element]
  }

  get childViews () {
    return this.#childViews
  }

  get placeholder () {
    return this.#placeholder
  }

  get retainFormatting () {
    return this.#retainFormatting
  }

  get routers () {
    return this.#routers
  }

  replace (nodes) {
    for (let i = 1, { length } = this.nodes; i < length; i++) {
      const node = this.nodes[i]
      removeDOMEventsByNode(node)
      node.remove()
    }

    const existingNode = this.nodes.at(0)
    removeDOMEventsByNode(existingNode)

    existingNode.replaceWith(...nodes)
    this.nodes = nodes
  }
}