import DataBinding from './DataBinding'
import { getViewRenderingTasks, unmountView } from '../rendering/Renderer'

export default class ViewBinding extends DataBinding {
  #node
  #boundView = null

  constructor (view, node, interpolation) {
    super(view, interpolation)
    this.#node = node
  }

  reconcile () {
    super.reconcile(({ current }) => {
      const { children } = this.view

      if (this.#boundView) {
        children.splice(children.indexOf(this.#boundView), 1)
        unmountView(this.#boundView)
      }

      if (!current) {
        this.#boundView = null
        return
      }

      const tree = {}

      const tasks = getViewRenderingTasks({
        view: this.view,
        rootNode: this.#node,
        config: current
      }, { rootLevel: true }, tree)

      this.#boundView = tree.rootView
      children.push(this.#boundView)
      tasks.forEach(({ callback }) => callback())
    })
  }
}