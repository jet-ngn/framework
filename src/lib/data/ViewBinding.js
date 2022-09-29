import DataBinding from './DataBinding'
import { getViewRenderingTasks, unmountView } from '../rendering/Renderer'
import { TREE } from '../../env'

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

      const tasks = getViewRenderingTasks({
        view: this.view,
        rootNode: this.#node,
        config: current
      }, { rootLevel: true })

      this.#boundView = TREE.rootView
      tasks.forEach(({ callback }) => callback())
    })
  }
}