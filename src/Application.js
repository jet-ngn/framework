import { getViewRenderingTasks, unmountView } from './lib/rendering/Renderer'

export default class Application {
  #config
  #rootNode
  #view

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  render () {
    const { view, tasks } = getViewRenderingTasks({
      rootNode: this.#rootNode,
      config: this.#config
    }, { rootLevel: true })

    this.#view = view
    
    tasks.forEach(({ name, callback }) => {
      console.log(name)
      callback()
    })
  }

  rerender () {
    unmountView(this.#view)
    this.render()
  }
}