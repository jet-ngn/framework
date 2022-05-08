import View from './View.js'
import TrackableRegistry from './TrackableRegistry.js'
import EventRegistry from './EventRegistry.js'
import RouterRegistry from './RouterRegistry.js'
import DefaultRoutes from './lib/routes.js'
import Route from './Route.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'
import { renderTemplate } from './Renderer.js'
import { html } from './lib/tags.js'

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
    const view = new View(parent, root, config, route, options)
    let { routes } = config
    let router
    
    const record = {
      view,
      
      mount: (path = null) => {
        console.log('MOUNT', view.name);
        let template = config.render?.call(view) ?? html``

        if (!!routes) {
          router = RouterRegistry.register(view, routes)
          let { route, remaining } = router.match(path)
          console.log(path)
          console.log(route, remaining);
          
          if (route) {
            RouterRegistry.currentRoute = route
            return this.#render(router, parent, root, route, remaining)
          }

          route = router.get(404) ?? new Route(view, 404, DefaultRoutes[404])
          RouterRegistry.currentRoute = route
          path = this.#render(router, parent, root, route, path)
        }

        if (template) {
          let content = renderTemplate(view, template)
          
          view.children.forEach(child => {
            const result = this.mount(child.id, path)
            path = path === '' ? path : result
          })
          
          if (!!path && path !== '') {
            content = renderTemplate(view, (router?.get(404) ?? DefaultRoutes[404]).render?.call(view))
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

    nodes.set(view.root, record)
    views[view.id] = record
    return record
  }

  static mount (id, path) {
    const { mount } = views[id] ?? {}
    return mount && mount(path)
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