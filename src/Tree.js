import { renderView, unmountView, runTasks } from './lib/rendering/Renderer'
import View from './lib/rendering/View'
import RouteManager from './lib/routing/RouteManager'

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
    (collection ?? this.#routers)?.set(new RouteManager(config), {
      views: target,
      children: new Map
    })
  }

  async removeChildView (collection, view) {
    const kids = collection.get(view)

    if (kids) {
      for (const [child] of kids) {
        await this.removeChildView(kids, child)
      }
    }

    await unmountView(view)
    collection.delete(view)
  }

  updateRouters (callback) {
    runTasks(this.#getRouterUpdateTasks(location.pathname, this.#routers), null, callback)
  }

  * #getRouterUpdateTasks (path, routers) {
    for (const [router, { views, children }] of routers) {
      yield [`Update Router`, async ({ next }) => {
        await this.#updateRouter(path, router, { views, children }, next)
      }]

      yield * this.#getRouterUpdateTasks(router.path.remaining, children)
    }
  }

  async #updateRouter (path, router, { views, children }, next) {
    const view = router.getMatchingView(path),
          { previousView } = router

    if (view === previousView) {
      return next()
    }

    !!previousView && await this.removeChildView(views, previousView)
    !views.has(view) && views.set(view, new Map)
    renderView(this.#app, view, views.get(view), { parentRouter: router, childRouters: children }, { replaceChildren: true }, next)
  }
}