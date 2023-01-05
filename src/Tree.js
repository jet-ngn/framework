// import { mountView, unmountView } from './lib/rendering/Renderer'
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
    const router = new Router(config)
    
    const value = {
      views: target,
      children: new Map
    }

    collection ? collection.set(router, value) : this.#routers.set(router, value)
  }

  removeChildView (collection, view) {
    collection.delete(view)
  }

  async updateRouters () {
    const tasks = []

    if (this.#routers.size === 0) {
      return console.log('There are no routers. The result of the route match will affect the root view.')
    }

    await this.#updateRouters(location.pathname, this.#routers, { tasks })

    for (const task of tasks) {
      await task()
    }
  }
  
  async #updateRouters (path, routers, options) {
    for (const entry of routers) {
      await this.#updateRouter(path, ...entry, options)
    }
  }

  async #updateRouter (path, router, { views, children }, { tasks }) {
    console.log('UPDATE ROUTER')
    // let view = router.getView(path)
    // const { previousView } = router
    
    // if (view !== previousView) {
    //   !!previousView && await unmountView(previousView)
    //   !views.has(view) && views.set(view, new Map)
    //   !view.mounted && await mountView(this.#app, view, views.get(view), { tasks, deferMount: true, replaceChildren: true }, { parentRouter: router, childRouters: children })
    // }

    // // TODO: Unmount children if parent didn't match
    // // if (!!router.path.remaining) {
    //   await this.#updateRouters(router.path.remaining, children, { tasks })
    // // }
  }
}