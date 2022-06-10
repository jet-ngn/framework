import Entity from './Entity'

export default class View extends Entity {
  #route

  constructor (parent, rootNode, config, route) {
    super(parent, rootNode, config, 'view')
    this.#route = route ?? null
  }

  get route () {
    return this.#route
  }
}