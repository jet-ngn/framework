import { getViewRenderingTasks, unmountView } from './lib/rendering/Renderer'
import { TREE } from './env'

import { listeners, views } from './lib/events/Bus'

export default class Application {
  #config
  #rootNode

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  render () {
    const tasks = getViewRenderingTasks({
      rootNode: this.#rootNode,
      config: this.#config
    }, { rootLevel: true, setDeepestRoute: true })

    for (let { callback } of tasks) {
      let stop = false
      callback(() => stop = true)

      if (stop) {
        break
      }
    }

    console.log(views);
  }

  rerender () {
    unmountView(TREE.rootView)
    this.render()
  }
}