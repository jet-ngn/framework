import View from './rendering/View'
import RouteManager from './routing/RouteManager'

import { runTasks } from './TaskRunner'
import { Plugins } from '../env'
import { getViewMountingTasks, getViewRemovalTasks, getViewRenderingTasks } from './rendering/Renderer'
import { getPermittedView } from '../utilities/permissions'

export default class Application {
  #views = new Map
  #root
  #routers = new Map

  constructor (element, config) {
    config.plugins?.forEach(({ install }) => install(Plugins))
    this.#root = this.addChildView(this.#views, { element, config })
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
    const stagedViews = new Set

    this.#runTasks(getViewRenderingTasks(this, ...this.#root, this.#routers, null, stagedViews), () => {
      this.#runTasks(getViewMountingTasks(stagedViews))
    })
  }

  update () {
    const stagedViews = new Set

    this.#runTasks(this.#getRouterCollectionUpdateTasks(location.pathname, this.#routers, stagedViews), () => {
      this.#runTasks(getViewMountingTasks(stagedViews))
    })
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

  * getChildRouterInitializationTasks (collection, target, config, stagedViews) {
    const router = new RouteManager(config)

    config = {
      views: target,
      children: new Map
    }

    collection = collection ?? this.#routers
    collection.set(router, config)
    
    yield * this.#getRouterUpdateTasks(location.pathname, router, config, stagedViews)
  }

  * #getRouterCollectionUpdateTasks (path, routers, stagedViews) {
    for (const [router, { views, children }] of routers) {
      yield * this.#getRouterUpdateTasks(path, router, { views, children }, stagedViews)
    }
  }

  * #getRouterUpdateTasks (path, router, { views, children }, stagedViews) {
    let view = router.getMatchingView(path),
        { previousView } = router,
        isMounted = previousView === view

    if (!isMounted) {
      previousView && (yield * getViewRemovalTasks(this, views, previousView, stagedViews))
      yield this.#getTreeInsertTask(views, view) 
    }

    const childViews = views.get(view)

    if (!isMounted) {
      yield * this.#getMatchedViewRenderingTasks(view, childViews, router, children, stagedViews)
    }

    const { remaining } = router.path
    
    if (children.size > 0) {
      return yield * this.#getRouterCollectionUpdateTasks(remaining, children, stagedViews)
    }

    if (!remaining) {
      return
    }

    if (childViews) {
      for (const childView of childViews) {
        yield * getViewRemovalTasks(this, childViews, childView, stagedViews, false)
      }
    }

    stagedViews.delete(view)
    yield * getViewRemovalTasks(this, views, view, stagedViews, false)
    view = router.notFoundView
    yield this.#getTreeInsertTask(views, view)
    yield * this.#getMatchedViewRenderingTasks(view, childViews, router, children, stagedViews)
  }

  * #getMatchedViewRenderingTasks (view, childViews, router, children, stagedViews) {
    yield * getViewRenderingTasks(this, view, childViews, {
      parentRouter: router,
      childRouters: children
    }, { replaceChildren: true }, stagedViews)
  }

  #getTreeInsertTask (views, view) {
    return [`Insert "${view.name}" view into tree`, ({ next }) => {
      views.set(view, new Map)
      next()
    }]
  }
}