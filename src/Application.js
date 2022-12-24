import { getViewInitializationTasks, unmountView } from './lib/rendering/Renderer'
import { getViewReconciliationTasks } from './lib/rendering/Reconciler'
import { removeBindings } from './lib/data/DataRegistry'
import { removeDOMEvents } from './lib/events/DOMBus'
import { removeEvents } from './lib/events/Bus'
import { Plugins, TREE, PATH } from './env'

export default class Application {
  #config
  #rootNode

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
    config.plugins?.forEach(({ install }) => install(Plugins))
  }

  async render () {
    const tasks = getViewInitializationTasks({
      rootNode: this.#rootNode,
      config: this.#config
    }, { rootLevel: true, setDeepestRoute: true })
    
    for (let { callback, name } of tasks) {
      let stop = false
      await callback(() => stop = true)

      if (stop) {
        break
      }
    }
  }

  async rerender () {
    const tasks = getViewReconciliationTasks(TREE.deepestRoute)
    
    for (let { callback, name } of tasks) {
      let stop = false
      await callback(() => stop = true)

      if (stop) {
        break
      }
    }

    // await unmountView(TREE.rootView)
    // removeDOMEvents()
    // removeEvents()
    // removeBindings()
    // await this.render()
  }
}