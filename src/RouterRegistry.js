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
    return history.push(previous)
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