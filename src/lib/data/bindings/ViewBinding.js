import DataBinding from './DataBinding'
import { getViewInitializationTasks, unmountView } from '../../rendering/Renderer'

export default class ViewBinding extends DataBinding {
  #node
  #boundView = null

  constructor (view, node, interpolation) {
    super(view, interpolation)
    this.#node = node
  }

  async reconcile () {
    await super.reconcile(async ({ current }) => {
      const { children } = this.view

      if (this.#boundView) {
        children.delete(this.#boundView)
        await unmountView(this.#boundView)
      }

      if (!current) {
        this.#boundView = null
        return
      }

      const tree = {}

      const tasks = getViewInitializationTasks({
        parent: this.view,
        rootNode: this.#node,
        config: current
      }, { rootLevel: true }, tree)

      this.#boundView = tree.rootView
      children.add(this.#boundView)

      for (let { callback } of tasks) {
        await callback()
      }
    })
  }
}