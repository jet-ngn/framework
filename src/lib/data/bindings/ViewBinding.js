import DataBinding from './DataBinding'
// import { renderView } from '../../rendering/Renderer'

export default class ViewBinding extends DataBinding {
  #boundView = null
  #childViews
  #element
  #routers

  constructor (app, view, config, element, childViews, routers) {
    super(app, view, config)
    this.#element = element
    this.#childViews = childViews
    this.#routers = routers ?? null
  }

  reconcile (cb) {
    super.reconcile(({ current }) => {
      if (this.#boundView) {
        this.app.tree.removeChildView(this.#childViews, this.#boundView)
      }

      if (!current) {
        this.#boundView = null
        return
      }

      const [view, childViews] = this.app.tree.addChildView(this.#childViews, {
        parent: this.view,
        element: this.#element,
        config: current
      })

      this.#boundView = view
      // renderView(this.app, view, childViews, this.#routers, { replaceChildren: true }, cb)
    })
  }
}