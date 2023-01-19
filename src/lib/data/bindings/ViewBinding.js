import DataBinding from './DataBinding'
import { getViewMountingTasks, getViewRemovalTasks, getViewRenderingTasks } from '../../rendering/Renderer'
import { runTasks } from '../../TaskRunner'

export default class ViewBinding extends DataBinding {
  #boundView = null
  #childViews
  #element
  #routers

  constructor ({ app, view, element, config, childViews, routers }) {
    super(app, view, config)
    this.#element = element
    this.#childViews = childViews
    this.#routers = routers ?? null
  }

  async reconcile (init = false, stagedViews) {
    runTasks(this.#getReconciliationTasks(init, super.reconcile(init), stagedViews))
  }

  * #getReconciliationTasks (init, { current }, stagedViews) {
    if (this.#boundView) {
      yield * getViewRemovalTasks({
        app: this.app,
        collection: this.#childViews,
        view: this.#boundView,
        stagedViews
      })
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

    this.#boundView = view

    yield * getViewRenderingTasks({
      app: this.app,
      view,
      childViews: children,
      routers: this.#routers,
      stagedViews
    })

    if (!init) {
      yield * getViewMountingTasks(new Set([view]))
    }
  }
}