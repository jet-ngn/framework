import Tree from './rendering/Tree'
import { Plugins } from '../env'

export default class Application {
  #tree

  constructor (element, config) {
    config.plugins?.forEach(({ install }) => install(Plugins))
    this.#tree = new Tree(this, element, config)
  }

  get tree () {
    return this.#tree
  }

  render () {
    this.#tree.render()
  }

  update () {
    this.#tree.updateRouters()
  }
}