import { mountView } from './lib/rendering/Renderer'
import View from './lib/rendering/View'
import Router from './lib/routing/Router'

import NotFound from './lib/rendering/views/404.js'

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
    return collection.set(view, this.#getMappings(view)).entries().next().value
  }

  addChildRouter (collection, config) {
    collection.push(new Router(config))
  }

  async updateRouters () {
    const tasks = []
    const routers = [...this.#routers.keys()].reduce((result, routers) => [...result, ...routers], [])

    if (routers.length === 0) {
      return console.log('There are no routers. The result of the route match will affect the root view.')
    }

    await this.#updateRouters(location.pathname, this.#root[1], { tasks })

    for (const task of tasks) {
      await task()
    }
  }

  async #updateRouters (path, { routers, children }, { tasks }) {
    for (const router of routers) {
      const stats = {
        matched: null,
        remaining: path
      }

      let view = router.getView(stats)

      if (!view || stats.remaining) {
        view = new View({ parent: view.parent, element: view.element, config: NotFound })
      }

      !children.has(view) && children.set(view, this.#getMappings(view))
      !view.mounted && await mountView(this.#app, view, children.get(view), { tasks, deferMount: true })
    }

    if (children.size > 0) {
      for (const child of children.values()) {
        await this.#updateRouters(path, child, { tasks })
      }
    }
  }

  #getMappings (view) {
    const routers = []
    this.#routers.set(routers, view)
    return { routers, children: new Map }
  }
}