import View from './rendering/View'
import RouteManager from './routing/RouteManager'

import { runTasks } from './TaskRunner'
import { Plugins } from '../env'
import { getViewRemovalTasks, getViewRenderingTasks } from './rendering/Renderer'
import { getPermittedView } from '../utilities/permissions'

export default class Application {
  #views = new Map
  #root
  #routers = new Map

  constructor (element, config) {
    config.plugins?.forEach(({ install }) => install(Plugins))
    this.#root = this.addChildView(this.#views, { element, config })
  }

  addChildRouter (collection, target, config) {
    const router = new RouteManager(config)

    config = {
      views: target,
      children: new Map
    }

    collection = collection ?? this.#routers
    collection.set(router, config)
  }

  addChildView (collection, config) {
    const view = getPermittedView(new View(config))
    const children = new Map
    collection.set(view, children)
    return [view, children]
  }

  getTreeNode (collection, view) {
    return collection.get(view)
  }

  removeTreeNode (collection, view) {
    collection.delete(view)
  }

  render () {
    this.#runTasks(getViewRenderingTasks(this, ...this.#root, this.#routers, null), () => this.update())
  }

  update () {
    this.#runTasks(this.#getRouterCollectionUpdateTasks(location.pathname, this.#routers))
  }

  #runTasks (tasks, callback) {
    const handlers = {
      restart: () => this.render(tasks, handlers)
    }

    if (callback) {
      handlers.callback = callback
    }
    
    runTasks(tasks, handlers)
  }

  * #getRouterCollectionUpdateTasks (path, routers) {
    for (const [router, { views, children }] of routers) {
      yield * this.#getRouterUpdateTasks(path, routers, router, { views, children })
    }
  }

  #removeRoutersByView (collection, view) {
    for (const [router] of collection) {
      if (router.parentView === view) {
        collection.delete(router)
      }
    }
  }

  * #getRouterUpdateTasks (path, routers, router, { views, children }) {
    let view = router.getMatchingView(path),
        { previousView } = router,
        isMounted = previousView === view

    if (!isMounted && previousView) {
      yield * getViewRemovalTasks(this, views, previousView)

      yield [`Remove routers associated with "${previousView.name}"`, ({ next }) => {
        this.#removeRoutersByView(children, previousView)
        next()
      }]
    }

    !!view && (yield this.#getTreeInsertTask(views, view))

    if (!view) {
      return
    }
    
    const childViews = views.get(view)

    if (!isMounted) {
      yield * this.#getMatchedViewRenderingTasks(view, childViews, router, children)
    }

    const { remaining } = router.path

    if (children.size > 0) {
      return yield * this.#getRouterCollectionUpdateTasks(remaining, children)
    }

    if (!remaining) {
      return
    }

    if (childViews) {
      for (const childView of childViews) {
        yield * getViewRemovalTasks(this, childViews, childView, false)
      }
    }

    yield * getViewRemovalTasks(this, views, view, false)
    view = router.notFoundView
    yield this.#getTreeInsertTask(views, view)
    yield * this.#getMatchedViewRenderingTasks(view, childViews, router, children)
  }

  * #getMatchedViewRenderingTasks (view, childViews, router, children) {
    yield * getViewRenderingTasks(this, view, childViews, {
      parentRouter: router,
      childRouters: children
    }, { replaceChildren: true })
  }

  #getTreeInsertTask (views, view) {
    return [`Insert "${view.name}" view into tree`, ({ next }) => {
      views.set(view, new Map)
      next()
    }]
  }
}