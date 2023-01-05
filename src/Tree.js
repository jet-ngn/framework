import { renderView, unmountView } from './lib/rendering/Renderer'
import View from './lib/rendering/View'
import Router from './lib/routing/Router'

export default class Tree {
  #app
  #map = new Map
  #root
  #routers = new Map

  constructor (app, element, config) {
    this.#app = app
    this.#root = this.addChildView(this.#map, new View({ element, config }))
  }

  get root () {
    return this.#root
  }

  addChildView (collection, config) {
    const view = config instanceof View ? config : new View(config)
    const map = new Map
    collection.set(view, map)
    return [view, map]
  }

  addChildRouter (collection, target, config) {
    console.log('HEY');
    const router = new Router(config)
    
    const value = {
      views: target,
      children: new Map
    }

    collection ? collection.set(router, value) : this.#routers.set(router, value)
  }

  removeChildView (collection, view) {
    unmountView(view)
    collection.delete(view)
  }

  updateRouters () {
    this.#updateRouters(location.pathname, this.#routers)
  }
  
  #updateRouters (path, routers) {
    for (const entry of routers) {
      this.#updateRouter(path, ...entry)
    }
  }

  #updateRouter (path, router, { views, children }) {
    let view = router.getView(path)
    const { previousView } = router

    const callback = () => this.#updateRouters(router.path.remaining, children)

    if (view !== previousView) {
      !!previousView && this.removeChildView(views, previousView)
      !views.has(view) && views.set(view, new Map)
      return renderView(this.#app, view, views.get(view), { parentRouter: router, childRouters: children }, { replaceChildren: true }, callback)
    }

    // TODO: Unmount children if parent didn't match
    callback()
  }
}