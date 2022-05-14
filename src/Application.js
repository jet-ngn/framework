import Entity from './Entity'
import Router from './Router'
import { INTERNAL_ACCESS_KEY, PATH } from './env'

function mount ({ type, target, children }) {
  type === 'entity' && target.emit(INTERNAL_ACCESS_KEY, 'mount')
  children.forEach(mount)
}

export default class Application extends Entity {
  #children = []
  #router

  constructor (root, { routes }) {
    super(null, ...arguments, 'app')
    this.#router = new Router(this, root, routes)
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
    this.#children.forEach(mount)
    this.emit(INTERNAL_ACCESS_KEY, 'mount')
  }
}