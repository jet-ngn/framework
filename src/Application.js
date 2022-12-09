import { getViewRenderingTasks, unmountView } from './lib/rendering/Renderer'
import { removeBindings } from './lib/data/DataRegistry'
import { removeDOMEvents } from './lib/events/DOMBus'
import { removeEvents } from './lib/events/Bus'
import { Plugins } from './env'

export default class Application {
  #config
  #rootNode
  #tree = {}

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
    config.plugins?.forEach(({ install }) => install(Plugins))
  }

  async render () {
    const tasks = getViewRenderingTasks({
      rootNode: this.#rootNode,
      config: this.#config
    }, { rootLevel: true, setDeepestRoute: true }, this.#tree)
    
    for (let { callback } of tasks) {
      let stop = false
      await callback(() => stop = true)

      if (stop) {
        break
      }
    }
  }

  async rerender () {
    await unmountView(this.#tree.rootView)
    removeDOMEvents()
    removeEvents()
    removeBindings()
    await this.render()
  }
}