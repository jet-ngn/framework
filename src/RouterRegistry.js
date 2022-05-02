import ViewRegistry from './ViewRegistry.js'
import Router from './Router.js'
import history from 'history'
import DefaultRoutes from './lib/routes.js'

const routers = []
const views = new Map

export default class RouterRegistry {
  baseURL = null

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

  // TODO: Check location against current route

  // let previous

  // for (let i = 0, { length } = routers; i < length; i++) {
  //   const router = routers[i]
  //   const { route, remaining } = router.match(location.pathname)

  //   if (route) {
  //     const { parent, root } = router.view
  //     const custom404 = router.get(404) ?? previous?.get(404) ?? null

  //     const registered = ViewRegistry.register({
  //       parent,
  //       root,
  //       config: route?.view ?? custom404?.view ?? DefaultRoutes[404]
  //     })

  //     router.current.unmount()
  //     router.current = registered
  //     registered.mount(remaining)
  //     previous = router
  //     break
  //   }
  // }
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