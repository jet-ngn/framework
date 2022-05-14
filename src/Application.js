import Entity from './Entity'
import Router from './Router'
import EventRegistry from './registries/EventRegistry'
import { INTERNAL_ACCESS_KEY, PATH } from './env'

function mount ({ type, target, children }) {
  children.forEach(mount)
  type === 'entity' && target.emit(INTERNAL_ACCESS_KEY, 'mount')
}

function unmount ({ type, target, children }) {
  children.forEach(unmount)

  if (type === 'entity') {
    target.emit(INTERNAL_ACCESS_KEY, 'unmount')
    EventRegistry.removeByEntity(target)
  }
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

  reconcile () {
    this.emit(INTERNAL_ACCESS_KEY, 'unmount')
    this.#children.forEach(unmount)
    this.#children = []
    this.render()
  }

  render () {
    this.root.replaceChildren(this.#router.render(this.#children))
    this.#children.forEach(mount)
    this.emit(INTERNAL_ACCESS_KEY, 'mount')
  }
}