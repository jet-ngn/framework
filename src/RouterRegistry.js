import Router from './Router.js'
import history from 'history'
import ViewRegistry from './ViewRegistry.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'

const routers = []
const views = new Map

export default class RouterRegistry {
  baseURL = null
  currentRoute

  static combinePaths (...paths) {
    const chunks = paths.map(this.removeSlashes).filter(Boolean)
    return `/${chunks.join('/')}`
  }

  static getRemainingPath (path, matched) { 
    console.log(path, matched);
  }
  
  static getSlugs (path) {
    return this.removeSlashes(path).split('/').filter(Boolean)
  }

  static register (view, routes) {
    const router = new Router(...arguments, this.baseURL)
    routers.push(router)
    views.set(view, router)
    return router
  }

  static remove (router) {
    routers.splice(routers.indexOf(router), 1)
  }

  static removeSlashes (path) {
    return path.replace(/^\/+|\/+$/g, '')
  }
}

history.listen(({ action, location }) => {
  console.log(action, location)

  const router = routers[0]
  const { route, remaining } = router.match(location.pathname)
  let aborted = false
  let previous = RouterRegistry.currentRoute

  router.view.emit(INTERNAL_ACCESS_KEY, 'route.change', {
    from: previous,
    to: route ?? location,
    abort: () => aborted = true
  })

  if (aborted) {
    return
  }

  const registered = ViewRegistry.register({
    parent: router.view.parent,
    root: router.view.root,
    config: route?.viewConfig ?? router.get(404)?.viewConfig ?? DefaultRoutes[404]
  })

  RouterRegistry.currentRoute = route

  router.current && router.current.unmount()
  router.current = registered
  registered.mount(remaining)

  router.view.emit(INTERNAL_ACCESS_KEY, 'route.changed', {
    from: previous,
    to: route ?? location
  })
})

// history.listen(({ action, location }) => {
//   // const { pathname } = location
//   // let aborted = false
  
//   // let previous = {
//   //   path: current.path
//   // }

//   console.log(action, location);

//   // App.emit(INTERNAL_ACCESS_KEY, 'route.change', {
//   //   from: current.path,
//   //   to: pathname,
//   //   abort: () => aborted = true
//   // }, ...args)

//   // console.log(App.routes.match(pathname));

//   // if (!aborted) {
//   //   current.unmount()
//   //   mountView(App.routes.match(pathname))
//   //   current.path = pathname
//   // }

//   // App.emit(INTERNAL_ACCESS_KEY, 'route.changed', {
//   //   from: previous.path,
//   //   to: pathname
//   // }, ...args)

//   // args = []
// })