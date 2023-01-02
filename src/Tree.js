import { mountView } from './lib/rendering/Renderer'
import View from './lib/rendering/View'
import Router from './lib/routing/Router'

export default class Tree {
  #app
  #map = new Map
  #root
  #routers = new Map

  constructor (app, element, config) {
    this.#app = app

    const view = new View({ element, config })

    this.#map.set(view, this.#getMappings(view))
    this.#root = this.#map.entries().next().value
  }

  get root () {
    return this.#root
  }

  get routers () {
    return this.#routers
  }

  addChildView (collection, config) {
    const view = new View(config),
          mappings = this.#getMappings(view)
    
    collection.set(view, mappings)
    return [view, mappings]
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

    await this.#updateRouters(...this.#root, { tasks })
  }

  // Views shouldn't be created unless they don't already exist. They should prolly be stored on the
  // routers to facilitate this. That way they can be mounted or unmounted without the need to nuke them.
  async #updateRouters (parentView, { routers, children }, { tasks }) {
    const { pathname } = location

    for (const router of routers) {
      const path = {
        matched: null,
        remaining: pathname
      }

      const config = router.getViewConfig(pathname, path)

      if (!!config) {
        const { element } = router
        const view = new View({ parent: parentView, element, config })

        if (!children.has(view)) {
          children.set(view, this.#getMappings(view))
        }

        await mountView(this.#app, view, children.get(view), { tasks })
      }

      console.log(path)
    }
  }

  #getMappings (view) {
    const routers = []
    this.#routers.set(routers, view)
    
    return { routers, children: new Map }
  }
}