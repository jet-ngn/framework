import View from './View'
import RouteManager from './router/RouteManager'

import { runTasks } from './lib/TaskRunner'
import { getViewMountingTasks, getViewRemovalTasks, getViewRenderingTasks } from './renderer/Renderer'
import { getPermittedView } from './utilities/permissions'
import { logBindings } from './data/DataRegistry'

export default class Application {
  #views = new Map
  #element
  #root
  #routers = new Map

  constructor (element, config) {
    this.#element = element
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
    const stagedViews = new Set
    const [view, childViews] = this.#root

    this.#runTasks(getViewRenderingTasks({
      app: this,
      view,
      childViews,
      routers: this.#routers,
      stagedViews
    }), () => this.update(() => this.#runTasks(getViewMountingTasks(stagedViews))))
  }

  update (callback) {
    const stagedViews = new Set

    this.#runTasks(this.#getRouterCollectionUpdateTasks(location.pathname, this.#routers, stagedViews), () => {
      callback && callback()
      this.#runTasks(getViewMountingTasks(stagedViews))
      // logBindings()
    })
  }

  * #getMatchedViewRenderingTasks (view, childViews, router, children, stagedViews) {
    yield * getViewRenderingTasks({
      app: this,
      view,
      childViews,
      stagedViews,
      options: { replaceChildren: true },
      
      routers: {
        parentRouter: router,
        childRouters: children
      },
    })
  }

  * #getRouterCollectionUpdateTasks (path, routers, stagedViews) {
    for (const [router, { views, children }] of routers) {
      yield * this.#getRouterUpdateTasks(path, routers, router, { views, children }, stagedViews)
    }
  }

  * #getRouterUpdateTasks (path, routers, router, { views, children }, stagedViews) {
    let view = router.getMatchingView(path),
        { previousView } = router,
        isMounted = previousView === view

    if (previousView && !isMounted) {
      yield * getViewRemovalTasks({
        app: this,
        collection: views,
        view: previousView,
        stagedViews
      })

      yield [`Remove routers associated with "${previousView.name}"`, ({ next }) => {
        this.#removeRoutersByView(children, previousView)
        next()
      }]
    }

    if (view) {
      views.set(view, new Map)
    } else {
      return
    }
    
    const childViews = views.get(view)

    if (!isMounted) {
      yield * this.#getMatchedViewRenderingTasks(view, childViews, router, children, stagedViews)
    }

    const { remaining } = router.path

    if (children.size > 0) {
      return yield * this.#getRouterCollectionUpdateTasks(remaining, children, stagedViews)
    }

    if (remaining) {
      yield * this.#getUnmatchedViewRenderingTasks(router, children, views, view, childViews, stagedViews)
    }
  }

  * #getUnmatchedViewRenderingTasks (router, children, views, view, childViews, stagedViews) {
    const args = {
      app: this,
      fireUnmountEvent: false,
      stagedViews
    }

    if (childViews) {
      for (const childView of childViews) {
        yield * getViewRemovalTasks({
          ...args,
          collection: childViews,
          view: childView
        })
      }
    }

    yield * getViewRemovalTasks({
      ...args,
      collection: views,
      view
    })

    view = router.notFoundView
    views.set(view, new Map)

    yield * this.#getMatchedViewRenderingTasks(view, childViews, router, children, stagedViews)
  }

  #runTasks (tasks, callback) {
    runTasks(tasks, {
      restart: () => this.render(tasks, handlers),
      callback
    })
  }

  #removeRoutersByView (collection, view) {
    for (const [router] of collection) {
      if (router.parentView === view) {
        collection.delete(router)
      }
    }
  }
}