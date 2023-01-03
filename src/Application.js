import Tree from './Tree'
import { mountView } from './lib/rendering/Renderer'
import { Plugins } from './env'

export default class Application {
  #tree

  constructor (element, config) {
    config.plugins?.forEach(({ install }) => install(Plugins))
    delete config.plugins
    delete config.selector

    this.#tree = new Tree(this, element, config)
  }

  get tree () {
    return this.#tree
  }

  async render () {
    const tasks = []

    await mountView(this, ...this.#tree.root, { tasks, deferMount: true })
    await this.#tree.updateRouters()

    for (const task of tasks) {
      await task()
    }
  }

  async update () {
    await this.#tree.updateRouters()
  }
}