import View from './rendering/View'
import RouteManager from './routing/RouteManager'
import { getViewRemovalTasks, getViewRenderingTasks } from './rendering/Renderer'
import { emitInternal } from './events/InternalBus'
import { runTasks } from './TaskRunner'
import { Plugins } from '../env'

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

  getTreeNode (collection, view) {
    return collection.get(view)
  }

  removeTreeNode (collection, view) {
    collection.delete(view)
  }

  render () {
    const views = new Set

    this.#runTasks(getViewRenderingTasks(this, ...this.#root, this.#routers, null, views), () => {
      this.#runTasks(this.#getViewMountingTasks(views), () => {
        console.log(this.#root)
      })
    })
  }

  update () {
    this.#runTasks(this.#getRouterCollectionUpdateTasks(location.pathname, this.#routers, false))
  }

  * #getViewMountingTasks (views) {
    for (const view of views) {
      yield [`Fire "${view.name}" view "mount" event`, async ({ next }) => {
        await emitInternal(view, 'mount')
        next()
      }]
    }
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
          { previousView } = router

    if (view !== previousView) {
      !!previousView && (yield * getViewRemovalTasks(this, views, previousView))

      !views.has(view) && (yield [`Insert "${view.name}" view into tree`, ({ next }) => {
        views.set(view, new Map)
        next()
      }])

      const childViews = views.get(view)

      yield * getViewRenderingTasks(this, view, childViews, {
        parentRouter: router,
        childRouters: children
      }, { replaceChildren: true }, stagedViews)
      
      const { remaining } = router.path
      
      if (!remaining) {
        return
      }

      if (children.size > 0) {
        return yield * this.#getRouterCollectionUpdateTasks(remaining, children, stagedViews) 
      }

      for (const childView of childViews) {
        stagedViews.delete(childView)
        yield * getViewRemovalTasks(this, childViews, childView, false)
      }

      stagedViews.delete(view)
      yield * getViewRemovalTasks(this, views, view, false)

      view = router.notFoundView

      yield [`Insert "${view.name}" view into tree`, ({ next }) => {
        views.set(view, new Map)
        next()
      }]

      yield * getViewRenderingTasks(this, view, childViews, {
        parentRouter: router,
        childRouters: children
      }, { replaceChildren: true }, stagedViews)
    }
  }
}