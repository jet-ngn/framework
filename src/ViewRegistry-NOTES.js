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
        console.log(`MOUNT "${view.name}" to`, root, 'AT', path);
        let template = config.render?.call(view)

        if (!!routes) {
          console.log('|  IS ROUTER', routes)
          router = RouterRegistry.register(view, routes)
          const { route, remaining } = router.match(path)
          
          if (route) {
            console.log('|  MATCHED', route)
            console.log('|  REMAINING PATH:', remaining)
            return this.#render(router, parent, root, route, remaining)
          }

          console.log('|  DID NOT MATCH');
          console.log('|  REMAINING PATH:', remaining)
          path = this.#render(router, parent, root, router.get(404) ?? new Route(404, DefaultRoutes[404]), path)
        } else {
          console.log('|  IS NOT ROUTER');
        }

        if (template) {
          console.log('|  ...AND HAS TEMPLATE. RENDERING...')
          let content = renderTemplate(view, template)
          
          view.children.forEach(child => {
            const result = this.mount(child.id, path)
            path = path === '' ? path : result
            console.log('remaining', path, child.name);
          })

          console.log('|  REMAINING: ', path, view.name)
          
          if (path !== '') {
            console.log('|  RENDER 404: ', view.name);
            content = renderTemplate(view, (router?.get(404) ?? DefaultRoutes[404]).render.call(view))
          }

          root.replaceChildren(content)
          view.emit(INTERNAL_ACCESS_KEY, 'mount')
        } else {
          console.log('DOES NOT HAVE TEMPLATE. RENDER 404')
        }

        return path
      },

      unmount: () => {
        console.log(`UNMOUNT VIEW "${view.name}"`)
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
        console.log(`UNMOUNTED VIEW "${view.name}"`)
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

// if (!!routes) {
        //   console.log('|  HAS ROUTES')
        //   router = RouterRegistry.register(view, routes)
        //   const match = router.match(path)
          
        //   if (match.route) {
        //     console.log('|  MATCHED', match.route)
        //     return this.#render(router, parent, root, match.route.viewConfig, match.remaining)
        //   } else {
        //     console.log('|  NO MATCH. RENDERING 404...')
        //     return this.#render(router, parent, root, router?.get(404)?.viewConfig ?? DefaultRoutes[404])
        //   }
        // } else {
        //   console.log('|  DOES NOT HAVE ROUTES')

        //   if (template) {
        //     console.log('|  ...BUT HAS TEMPLATE. RENDERING...')
            
        //     if (isChild && !!path && path !== '/') {
        //       console.log('|  HAS UNMATCHED PATH. RENDERING 404...', path)
        //       return this.#render(null, parent, root, DefaultRoutes[404])
        //     }

        //     content = renderTemplate(view, template)
        //     view.children.forEach(child => this.mount(child.id, path, true))
        //     root.replaceChildren(content)
        //     view.emit(INTERNAL_ACCESS_KEY, 'mount')
        //     return console.log(`|  MOUNTED "${view.name}"`);
        //   } else {
        //     console.log('|  ...OR A TEMPLATE. RENDERING 404...')
        //     return this.#render(null, parent, root, DefaultRoutes[404])
        //   }
        // }

        // view.children.forEach(child => this.mount(child.id, path))
        // root.replaceChildren(content)
        // view.emit(INTERNAL_ACCESS_KEY, 'mount')
        // console.log(`|  MOUNTED "${view.name}"`);

        // if (!!routes) {
        //   console.log(`|  HAS ROUTES`)
        //   const router = RouterRegistry.register(view, routes)
        //   const match = router.match(path)
          
        //   if (match.route) {
        //     console.log(`|  ROUTE MATCHED. RENDERING...`)
        //     return this.#render(router, parent, root, match.route.viewConfig, match.remaining)
        //   } else {
        //     console.log(`|  NO MATCHING ROUTE FOUND. RENDERING 404...`)
        //     return this.#render(router, parent, root, router.get(404)?.viewConfig ?? DefaultRoutes[404])
        //   }
        // } else {
        //   console.log(`|  DOES NOT HAVE ROUTES. CHECKING FOR TEMPLATE...`)

        //   if (template) {
        //     console.log(`|  HAS TEMPLATE. RENDERING...`, path)
            
        //     // if (!!path && view.children.length === 0) {
        //     //   console.log('THERE IS PATH REMAINING. RENDER 404', path)
        //     //   return this.#render(null, parent, root, DefaultRoutes[404])
        //     // }

        //     const content = renderTemplate(view, template, tasks)
        //     view.children.forEach(child => this.mount(child.id, path))
        //     root.replaceChildren(content)
        //     view.emit(INTERNAL_ACCESS_KEY, 'mount')
        //     return console.log(`|  MOUNTED "${view.name}"`);
        //   }
        // }

        // let router
        // let match
        // let content
        // let template = config.render?.apply(view)

        // if (!!routes) {
        //   console.log('| HAS ROUTES')

        //   router = RouterRegistry.register(view, routes)
        //   match = router.match(path)

        //   if (match.route) {
        //     console.log('|     MATCHED', match.route)
        //     console.log('|     REMAINING PATH', match.remaining)
        //   }
          
        //   if (match.route) {
        //     const registered = this.register({
        //       parent,
        //       root,
        //       config: match.route.viewConfig
        //     })

        //     if (router.current) {
        //       router.current.unmount()
        //     }

        //     router.current = registered.view
        //     return registered.mount(match.remaining)
        //   } else {
        //     console.log('|     MATCHING ROUTE NOT FOUND')

        //     if (template) {
        //       console.log('|     RENDER TEMPLATE')
        //       content = renderTemplate(view, template)
        //       root.replaceChildren(content)
        //       return view.children.forEach(child => this.mount(child.id, path))
        //     }

        //     const registered = this.register({
        //       parent,
        //       root,
        //       config: router?.get(404)?.viewConfig ?? DefaultRoutes[404]
        //     })

        //     if (router.current) {
        //       router.current.unmount()
        //     }

        //     router.current = registered.view
        //     return registered.mount(path)
        //   }
        // } else {
        //   console.log('|  DOES NOT HAVE ROUTES')

        //   if (template) {
        //     console.log('|  HAS TEMPLATE. RENDER')
        //     console.log(view);
        //     content = renderTemplate(view, template)
        //     // root.replaceChildren(content)
        //     // return view.children.forEach(child => this.mount(child.id, path))
        //   } else {
        //     console.log('|  DOES NOT HAVE TEMPLATE. RENDER 404')
        //     const registered = this.register({
        //       parent,
        //       root,
        //       config: router?.get(404)?.viewConfig ?? DefaultRoutes[404]
        //     })

        //     if (router.current) {
        //       router.current.unmount()
        //     }

        //     router.current = registered.view
        //     return registered.mount(path)
        //   }
        // }

        // if (!!path) {
        //   console.log('COMPLETE PATH DID NOT MATCH. RENDER 404');
        //   const registered = this.register({
        //     parent,
        //     root,
        //     config: router?.get(404)?.viewConfig ?? DefaultRoutes[404]
        //   })

        //   return registered.mount()
        // }

        // if (content) {
        //   root.replaceChildren(content)
        //   view.children.forEach(child => this.mount(child.id, path))
        // }

// if (template) {
        //   content = renderTemplate(view, template)
        //   root.replaceChildren(content)
        //   view.children.forEach(child => this.mount(child.id, match.remaining))
        //   console.log('| HAS TEMPLATE', content)
        //   console.log('---------------------------------')

        // } else {
        //   console.log('| DOES NOT HAVE TEMPLATE')
        //   console.log('---------------------------------')

        //   if (!!match.remaining) {
        //     console.log('PATH DID NOT MATCH. RENDER 404')
        //   }

        //   const registered = this.register({
        //     parent,
        //     root,
        //     config: match.route?.viewConfig ?? router.get(404)?.viewConfig ?? DefaultRoutes[404]
        //   })

        //   if (router.current) {
        //     router.current.unmount()
        //   }

        //   registered.mount(match.remaining)
        // }

// let content = renderTemplate(view, template, view.children, routes)

        // view.children.forEach(child => {
        //   routes = { ...routes, ...child.view.routes }
        //   console.log(child);
        //   child.mount(false)
        // })

        // const routers = {
        //   root: !!config.routes ? RouterRegistry.register(view, )
        // }

        // if (!!config.routes) {
        //   console.log('  HAS ROUTES', config.routes)
        //   const router = RouterRegistry.register(view, config.routes)
        //   const { route, remaining } = router.match(path)
          
        //   if (remaining) {
        //     console.log(view.children);
        //   }
        // }

        
        
        // let template = render?.apply(view)
        // let remainingPath = path

        // if (!!routes) {
        //   console.log('HAS ROUTES');
        //   const router = RouterRegistry.register(view, view.root, routes)
        //   const { route, remaining } = router.match(path, !!template)
        //   remainingPath = remaining
          
        //   if (route) {
        //     console.log('ROUTE MATCHED', route);

        //     const registered = this.register({
        //       parent,
        //       root,
        //       config: route?.viewConfig ?? router.get(404)?.viewConfig ?? DefaultRoutes[404]
        //     })
  
        //     if (router.current) {
        //       router.current.unmount()
        //     }
  
        //     router.current = registered
        //     console.log(remainingPath);
        //     registered.mount(remainingPath)
        //     return view.emit(INTERNAL_ACCESS_KEY, 'mount')
        //   }
        // }

        // if (template) {
        //   console.log('HAS TEMPLATE', remainingPath)
        //   let { content, tasks } = renderTemplate(view, template)

        //   tasks.forEach(task => task(remainingPath))
        //   root.replaceChildren(content)
        //   view.emit(INTERNAL_ACCESS_KEY, 'mount')
        // }
        
        // let router

        // if (!!routes) {
        //   console.log('VIEW HAS ROUTES. RENDER MATCHING ROUTE')
        //   router = RouterRegistry.register(view, view.root, routes ?? {})
        //   const { route, remaining } = router.match(location.pathname)
        //   const custom404 = router.get(404)

        //   const registered = this.register({
        //     parent,
        //     root,
        //     config: route?.view ?? custom404?.view ?? DefaultRoutes[404]
        //   })

        //   router.current = registered
        //   console.log('***');
        //   registered.mount(remaining, router)
        //   view.emit(INTERNAL_ACCESS_KEY, 'mount')
        //   console.log(`MOUNTED VIEW "${view.name}"`)
        // }

        // tasks.forEach(task => task(remainingPath))

        // if (remainingPath.length > 0) {
        //   console.log(`THE FULL PATH DID NOT MATCH. RENDER 404`)
        //   const custom404 = parentRouter?.get(404)

        //   const registered = this.register({
        //     parent,
        //     root,
        //     config: custom404?.view ?? DefaultRoutes[404]
        //   })

        //   parentRouter.current = registered
        //   registered.mount()
        //   return console.log('----------------------------------')
        // } else {
        //   console.log(`${!!router ? 'THE FULL PATH MATCHED. ' : ''}RENDER & FIRE MOUNT EVENT`)
        //   root.replaceChildren(content)
        //   // listeners?.mount && listeners.mount.call(view)
        //   view.emit(INTERNAL_ACCESS_KEY, 'mount')
        //   console.log(`MOUNTED VIEW "${view.name}"`);
        //   return console.log('----------------------------------')
        // }