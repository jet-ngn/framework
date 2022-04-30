import { renderTemplate } from './Renderer.js'
import View from './View.js'
import TrackableRegistry from './TrackableRegistry.js'
import EventRegistry from './EventRegistry.js'
import { html } from './lib/tags.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'
import RouterRegistry from './RouterRegistry.js'
import DefaultRoutes from './lib/routes.js'

const views = {}
const nodes = new Map

export default class viewsViewRegistry {
  static get (id) {
    return views[id] ?? null
  }

  static getEntryByNode (node) {
    return nodes.get(node)
  }

  static register ({ parent, root, config, options }) {
    const view = new View(parent, root, config)
    const { render, routes } = config
    // const { listeners, route } = options ?? {}
    
    const record = {
      view,
      
      mount: (remainingPath = [], parentRouter = null) => {
        console.log(`MOUNT VIEW "${view.name}"`)
        const template = render?.apply(view) ?? html``
        let { content, tasks, router } = renderTemplate(view, template, [])

        if (!router) {
          console.log('TEMPLATE DOES NOT HAVE ROUTER')

          if (!!routes) {
            console.log('...BUT PARENT VIEW DOES. RENDER ROOT-LEVEL ROUTES')
            router = RouterRegistry.register(view, view.root, routes ?? {})
            const { route, remaining } = router.match(location.pathname)
            const custom404 = router.get(404)

            const { mount } = this.register({
              parent,
              root,
              config: route?.view ?? custom404?.view ?? DefaultRoutes[404]
            })

            mount(remaining, router)
            return view.emit(INTERNAL_ACCESS_KEY, 'mount')
          }

          console.log('...AND NEITHER DOES PARENT VIEW. RENDER TEMPLATE: DONE')
          tasks.forEach(task => task(remainingPath))

          if (remainingPath.length > 0) {
            console.log('THE FULL PATH DID NOT MATCH. RENDER 404')
            const custom404 = parentRouter?.get(404)

            const { mount } = this.register({
              parent,
              root,
              config: custom404?.view ?? DefaultRoutes[404]
            })

            mount()
          } else {
            console.log('THE FULL PATH MATCHED. RENDER & FIRE MOUNT EVENT')
            root.replaceChildren(content)
            // listeners?.mount && listeners.mount.call(view)
            return view.emit(INTERNAL_ACCESS_KEY, 'mount')
          }
        }

        console.log('TEMPLATE HAS ROUTER. RENDER AND MATCH AGAINST CHILD ROUTES')
      },

      unmount: () => {
        const { children, id, root } = view

        // TODO: de-init router
        // router.stop()

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
        // config.view.on?.unmount?.call(view)
      }
    }

    views[view.id] = record
    return record
  }

  static mount (id) {
    const { mount } = views[id] ?? {}
    mount && mount()
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