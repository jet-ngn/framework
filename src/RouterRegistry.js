// import { LEDGER, INTERNAL_EVENT } from 'NGN'
import ViewRegistry from './ViewRegistry.js'
import Router from './Router.js'
import history from 'history'
import DefaultRoutes from './lib/routes.js'

const routers = []
const views = new Map

export default class RouterRegistry {
  baseURL = null

  static register (view, node, routes) {
    const router = new Router(...arguments, this.baseURL)
    routers.push(router)
    views.set(view, router)
    return router
  }
}

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

history.listen(({ action, location }) => {
  console.log(action, location)

  for (let i = 0, { length } = routers; i < length; i++) {
    const router = routers[i]
    const { route, remaining } = router.match(location.pathname)

    if (route) {
      const { parent, root } = router.view
      const custom404 = router.get(404)

      const { view, mount } = ViewRegistry.register({
        parent,
        root,
        config: route?.view ?? custom404?.view ?? DefaultRoutes[404]
      })

      console.log(view);

      mount(remaining, router)
      break
    }
  }
  
  // routers.forEach(router => {
  //   const { route, remaining } = router.match(location.pathname)

  //   if (route) {
  //     match = route
  //     remainingSlugs.push(...remaining)
  //   }
  //   console.log(route, remaining)
  // })
})

// LEDGER.on(INTERNAL_EVENT, (event, change) => {
//   if (event === 'route.change') {
//     const { action, location } = change

//     // TODO: Loop through routers and match against the path
//     // Return the portion of the path that is not matched, and attempt to match that against against the next router
//     // Once the entire path is matched, stop the loop
//     // If no path is matched, render 404
//     // Try using a generator for this?

//     console.log(location.pathname)

//     routers.forEach(router => {
//       const route = router.match(location.pathname)
//       console.log(route)
//     })
//   }
// })