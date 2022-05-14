import Entity from './Entity'
import Router from './Router'
import { PATH } from './env'

export default class Application extends Entity {
  #children = []
  #router

  constructor (root, { routes }) {
    super(null, ...arguments, 'app')
    this.#router = new Router(this, routes)
  }

  get baseURL () {
    return PATH.base.pathname
  }

  get children () {
    return this.#children
  }

  get routes () {
    return this.#router.routes
  }

  render () {
    this.root.replaceChildren(this.#router.render(this.#children))
    
    // TODO: loop through the tree and fire mount events
  }
}