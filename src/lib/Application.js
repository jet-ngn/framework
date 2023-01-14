import View from './rendering/View'
import { getViewRenderingTasks } from './rendering/Renderer'
import RouteManager from './routing/RouteManager'
import { runTasks } from './TaskRunner'
import { Plugins } from '../env'

import { logDOMEvents, removeDOMEventsByView } from './events/DOMBus'
import { logEvents, emitInternal, removeEventsByView } from './events/Bus'
import { logBindings, removeBindingsByView } from './data/DataRegistry'

export default class Application {
  #views = new Map
  #root
  #routers = new Map

  constructor (element, config) {
    config.plugins?.forEach(({ install }) => install(Plugins))
    this.#root = this.addChildView(this.#views, new View({ element, config }))
  }

  addChildView (collection, config) {
    const view = config instanceof View ? config : new View(config)
    const children = new Map
    collection.set(view, children)
    return [view, children]
  }

  render () {
    const tasks = getViewRenderingTasks(this, ...this.#root, this.#routers)

    const handlers = {
      restart: () => this.render(tasks, handlers)
    }
    
    runTasks(tasks, handlers)
  }

  update () {
    // let tasks = getViewRenderingTasks(this, ...this.#root, this.#routers, null)
    const tasks = this.#getRouterCollectionUpdateTasks(location.pathname, this.#routers, false)

    const handlers = {
      restart: () => this.render(tasks, handlers)
    }
    
    runTasks(tasks, handlers)
    // this.#tree.updateRouters()
  }

  * getChildRouterInitializationTasks (collection, target, config, isChild = false) {
    const router = new RouteManager(config)

    config = {
      views: target,
      children: new Map
    }

    collection = collection ?? this.#routers
    collection.set(router, config)
    
    yield * this.#getRouterUpdateTasks(location.pathname, router, config, isChild)
  }

  * #getRouterCollectionUpdateTasks (path, routers, isChild) {
    for (const [router, { views, children }] of routers) {
      yield * this.#getRouterUpdateTasks(path, router, { views, children }, isChild)
    }
  }

  * #getRouterUpdateTasks (path, router, { views, children }, isChild) {
    const view = router.getMatchingView(path),
          { previousView } = router

    if (view !== previousView) {
      !!previousView && (yield * this.#getViewRemovalTasks(views, previousView))

      !views.has(view) && (yield [`Insert "${view.name}" view into tree`, ({ next }) => {
        views.set(view, new Map)
        next()
      }])

      yield * getViewRenderingTasks(this, view, views.get(view), {
        parentRouter: router,
        childRouters: children
      }, { replaceChildren: true, isChild })

      yield * this.#getRouterCollectionUpdateTasks(router.path.remaining, children, isChild)
    }
  }

  * #getViewRemovalTasks (collection, view) {
    const kids = collection.get(view)

    if (kids) {
      for (const [child] of kids) {
        yield * this.#getViewRemovalTasks(kids, child)
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
}