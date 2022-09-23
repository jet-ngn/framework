import DataBinding from './DataBinding'
import View from '../../View'
import { unmountView } from '../rendering/Renderer'
import { INTERNAL_ACCESS_KEY } from '../../env'

export default class ViewBinding extends DataBinding {
  #node
  #view

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

      this.#view = new View(this.parent, this.#node, current)

      // let abort = false

      // this.#view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
      //   abort: () => abort = true
      // })

      // const tasks = []
      // const mountedViews = []
      
      // processTemplate(this.#view, this.#node, current.render?.call(this.#view) ?? html``, { tasks })

      // tasks.forEach(({ view, callback }) => {
      //   callback()

      //   if (!mountedViews.includes(view)) {
      //     view.emit(INTERNAL_ACCESS_KEY, 'mount')
      //   }

      //   mountedViews.push(view)
      // })
    })
  }
}