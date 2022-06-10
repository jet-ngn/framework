import Entity from './Entity'
// import Permissions from './Permissions'

export default class View extends Entity {
  #route

  constructor (parent, rootNode, { permissions }, route) {
    super(parent, rootNode, arguments[2], 'view')
    this.#route = route ?? null

    // if (!!permissions) {
    //   Permissions.addView(this, permissions)
    // }
  }

  get route () {
    return this.#route
  }
}