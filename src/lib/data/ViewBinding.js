import DataBinding from './DataBinding'
import { getViewRenderingTasks, unmountView } from '../rendering/Renderer'
import { TREE } from '../../env'

export default class ViewBinding extends DataBinding {
  #node
  #view = null

  constructor (parent, node, interpolation) {
    super(parent, interpolation)
    this.#node = node
  }

  reconcile () {
    super.reconcile(({ current }) => {
      const { children } = this.parent

      if (this.#view) {
        children.splice(children.indexOf(this.#view), 1)
        unmountView(this.#view)
      }

      if (!current) {
        this.#view = null
        return
      }

      const tasks = getViewRenderingTasks({
        parent: this.parent,
        rootNode: this.#node,
        config: current
      }, { rootLevel: true })

      this.#view = TREE.rootView
      tasks.forEach(({ callback }) => callback())
    })
  }
}