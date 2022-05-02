import { renderTemplate } from './Renderer.js'
import View from './View.js'
import TrackableRegistry from './TrackableRegistry.js'
import EventRegistry from './EventRegistry.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'
import RouterRegistry from './RouterRegistry.js'
import DefaultRoutes from './lib/routes.js'
import Route from './Route.js'

const views = {}
const nodes = new Map

export default class ViewRegistry {
  static get (id) {
    return views[id] ?? null
  }

  static getEntryByNode (node) {
    return nodes.get(node)
  }

  static #render (router, parent, root, route, path) {
    const registered = this.register({
      parent,
      root,
      config: route.viewConfig,
      route
    })

    if (router) {
      router.current && router.current.unmount()
      router.current = registered
    }

    return registered.mount(path)
  }

  static register ({ parent, root, config, route, options }) {
    const view = new View(parent, root, config, route)
    // const { listeners, route } = options ?? {}
    let { routes } = config
    let router
    
    const record = {
      view,
      
      mount: path => {
        let template = config.render?.call(view)

        if (!!routes) {
          router = RouterRegistry.register(view, routes)
          const { route, remaining } = router.match(path)
          
          if (route) {
            return this.#render(router, parent, root, route, remaining)
          }

          path = this.#render(router, parent, root, router.get(404) ?? new Route(404, DefaultRoutes[404]), path)
        }

        if (template) {
          let content = renderTemplate(view, template)
          
          view.children.forEach(child => {
            const result = this.mount(child.id, path)
            path = path === '' ? path : result
          })
          
          if (path !== '') {
            console.log('|  RENDER 404: ', view.name);
            content = renderTemplate(view, (router?.get(404) ?? DefaultRoutes[404]).render.call(view))
          }

          root.replaceChildren(content)
          view.emit(INTERNAL_ACCESS_KEY, 'mount')
        }

        return path
      },

      unmount: () => {
        const { children, id, root } = view

        if (router) {
          RouterRegistry.remove(router)
        }

        EventRegistry.removeAllByView(view)

        children.forEach(child => {
          TrackableRegistry.removeContentTrackersByView(child)
          this.unmount(child.id)
        })

        TrackableRegistry.removeContentTrackersByView(view)

        nodes.delete(root)
        delete views[id]

        // listeners?.unmount && listeners.unmount.call(view)
        view.emit(INTERNAL_ACCESS_KEY, 'unmount')
      }
    }

    views[view.id] = record
    return record
  }

  static mount (id, path, isChild) {
    const { mount } = views[id] ?? {}
    return mount && mount(path, isChild)
  }

  static unmount (id) {
    const { unmount } = views[id] ?? {}
    unmount && unmount()
  }

  static unmountByNode (node) {
    const { unmount } = this.getEntryByNode(node) ?? {}
    unmount && unmount()
  }
}