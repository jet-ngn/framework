import View from './View'
import { getViewRenderingTasks, unmountView } from './lib/rendering/Renderer'
import { TREE } from './env'

export default class Application {
  #config
  #rootNode
  #view

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  render () {
    this.#view = new View(null, this.#rootNode, this.#config)
    TREE.lowestChild = this.#view

    const tasks = getViewRenderingTasks(this.#view)
    
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