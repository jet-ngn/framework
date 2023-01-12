import { getViewRenderingTasks, getTemplateRenderingTasks } from './Renderer'
import { runTasks } from './TaskRunner'
import { emitInternal } from '../events/Bus'
import View from './View'
import RouteManager from '../routing/RouteManager'

import { logDOMEvents, removeDOMEventsByView } from '../events/DOMBus'
import { logEvents, removeEventsByView } from '../events/Bus'
import { logBindings, removeBindingsByView } from '../data/DataRegistry'

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

  initChildRouter (collection, target, config, callback) {
    const router = new RouteManager(config)

    config = {
      views: target,
      children: new Map
    }

    collection = collection ?? this.#routers
    collection.set(router, config)
    
    runTasks(this.#getRouterUpdateTasks(location.pathname, router, config), { callback })
  }

  render () {
    const tasks = getViewRenderingTasks(this.#app, ...this.root, this.#routers)

    const handlers = {
      restart: () => this.render(tasks, handlers)
    }

    runTasks(tasks, handlers)
  }

  * getViewRemovalTasks (collection, view) {
    const kids = collection.get(view)

    if (kids) {
      for (const [child] of kids) {
        yield * this.getViewRemovalTasks(kids, child)
      }
    }

    yield [`Unmount "${view.name}" view`, async ({ next }) => {
      await emitInternal(view, 'unmount')
      removeDOMEventsByView(view)
      removeEventsByView(view)
      removeBindingsByView(view)
      collection.delete(view)
      next()
    }]
  }

  updateRouters (callback) {
    const tasks = this.#getRouterCollectionUpdateTasks(location.pathname, this.#routers)
    runTasks(tasks, { callback })
  }

  * #getRouterCollectionUpdateTasks (path, routers) {
    for (const [router, { views, children }] of routers) {
      yield * this.#getRouterUpdateTasks(path, router, { views, children })
    }
  }

  * #getRouterUpdateTasks (path, router, { views, children }) {
    const view = router.getMatchingView(path),
          { previousView } = router

    if (view !== previousView) {
      !!previousView && (yield * this.getViewRemovalTasks(views, previousView))

      !views.has(view) && (yield [`Insert "${view.name}" into tree`, ({ next }) => {
        views.set(view, new Map)
        next()
      }])

      yield * getViewRenderingTasks(this.#app, view, views.get(view), {
        parentRouter: router,
        childRouters: children
      }, { replaceChildren: true })

      yield * this.#getRouterCollectionUpdateTasks(router.path.remaining, children)
    }
  }
}