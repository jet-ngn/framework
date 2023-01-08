import Tree from './Tree'
import { renderView } from './lib/rendering/Renderer'
import { Plugins } from './env'

export default class Application {
  #tree

  constructor (element, config) {
    config.plugins?.forEach(({ install }) => install(Plugins))
    this.#tree = new Tree(this, element, config)
  }

  get tree () {
    return this.#tree
  }

  async render () {
    renderView(this, ...this.#tree.root, null, null, () => this.#tree.updateRouters())
  }

  update () {
    this.#tree.updateRouters()
  }
}