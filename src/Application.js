import { renderView } from './lib/rendering/Renderer'
import { PATH, INTERNAL_ACCESS_KEY } from './env'
import { removeAllViewEvents } from './lib/events/Bus'

export default class Application {
  #rootNode
  #config
  #tree
  #mounted = false

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  get baseURL () {
    return PATH.base.pathname
  }

  render () {
    renderView(null, this.#rootNode, this.#config)
  }

  rerender () {
    removeAllViewEvents()
    this.#mounted && this.#tree.view.emit(INTERNAL_ACCESS_KEY, 'unmount')
    this.render()
  }
}

// function processIncludes ({ components, plugins }) {
//   components && components.forEach(({ install }) => install({ html, svg, createID }, Components))
//   // plugins && plugins.forEach(({ install }) => install({}, Plugins))
// }


