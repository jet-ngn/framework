import DataBinding from './DataBinding'
import { getViewRemovalTasks, getViewRenderingTasks } from '../../rendering/Renderer'

export default class ViewBinding extends DataBinding {
  #boundView = null
  #childViews
  #element
  #routers

  constructor (app, view, element, config, childViews, routers) {
    super(app, view, config)
    this.#element = element
    this.#childViews = childViews
    this.#routers = routers ?? null
  }

  * getReconciliationTasks ({ init = false } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this))
  }

  * #getReconciliationTasks (init, { previous, current }) {
    if (this.#boundView) {
      yield * getViewRemovalTasks(this.app, this.#childViews, this.#boundView)
    }
    
    if (!current) {
      this.#boundView = null
      return
    }

    const [view, children] = this.app.addChildView(this.#childViews, {
      parent: this.view,
      element: this.#element,
      config: current
    })

    yield * getViewRenderingTasks(this.app, view, children, this.#routers, null)
    this.#boundView = view
  }
}