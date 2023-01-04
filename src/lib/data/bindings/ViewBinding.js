import View from '../../rendering/View'
import { mountView } from '../../rendering/Renderer'
import DataBinding from './DataBinding'

export default class ViewBinding extends DataBinding {
  #boundView = null
  #collection
  #element
  #routers

  constructor (app, view, collection, element, interpolation, routers) {
    super(app, view, interpolation)
    this.#collection = collection
    this.#element = element
    this.#routers = routers ?? null
  }

  async reconcile () {
    await super.reconcile(async ({ current }) => {
      if (this.#boundView) {
        await unmountView(this.#boundView)
      }

      if (!current) {
        this.#boundView = null
        return
      }

      const tasks = []
      const view = new View({ parent: this.view, element: this.#element, config: current })
      
      await mountView(this.app, view, this.#collection, { tasks, replaceChildren: true }, this.#routers)
    })
  }
}