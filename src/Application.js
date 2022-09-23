import { getViewRenderingTasks, unmountView } from './lib/rendering/Renderer'
import { TREE } from './env'

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
    }, { rootLevel: true, setLowest: true })

    tasks.forEach(({ callback }) => callback())
  }

  rerender () {
    unmountView(TREE.rootView)
    this.render()
  }
}