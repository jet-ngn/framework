import { getViewRenderingTasks, unmountView } from './lib/rendering/Renderer'
import { removeBindings } from './lib/data/DatasetRegistry'
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

  render () {
    const tree = {}

    const tasks = getViewRenderingTasks({
      rootNode: this.#rootNode,
      config: this.#config
    }, { rootLevel: true, setDeepestRoute: true }, this.#tree)
    
    for (let { callback } of tasks) {
      let stop = false
      callback(() => stop = true)

      if (stop) {
        break
      }
    }
  }

  rerender () {
    unmountView(this.#tree.rootView)
    removeDOMEvents()
    removeEvents()
    removeBindings()
    this.render()
  }
}