// import Router from '../routing/Router'
// import Route from '../routing/Route'
// import View from '../../View'
// import { INTERNAL_ACCESS_KEY } from '../../env'

// // function renderRoute (parent, route, vars) {
// //   const { config } = route
// //   route = new Route({ url: route.url, vars })
  
// //   renderView(new View(parent, parent.rootNode, config, route), config)
// // }

// // export function renderView (view, { routes }) {
// //   let abort = false

// //   view.emit(INTERNAL_ACCESS_KEY, 'willMount', {
// //     abort: () => {
// //       abort = true

// //       view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
// //         retry: () => abort = false
// //       })
// //     }
// //   })

// //   if (abort) {
// //     return console.log(view);
// //   }

// //   const router = new Router(routes)
// //   let { route, vars } = router.matchingRoute

// //   if (route) {
// //     console.log(route);
// //     return renderRoute(view, route, vars)
// //   }

// //   console.log('RENDER TEMPLATE IF IT EXISTS');
// //   // let tree = generateTree(view, config)
// //   // console.log(tree);
// //   // view.emit(INTERNAL_ACCESS_KEY, 'mount')
// //   // console.log(view);
// // }

// export function generateTree (entity, { routes = {}, render } = {}) {
//   const router = new Router(routes)
//   let { route, vars } = router.matchingRoute

//   if (route) {
//     const view = new View(entity, entity.rootNode, route.config, new Route({ url: route.url, vars }))
//     return generateTree(view, route.config)
//   }

//   const template = render ? render() : null

//   if (!template) {
//     return new View(entity, entity.rootNode, {
//       name: '404 Not Found',
  
//       on: {
//         abortMount ({ retry }) {
//           console.log('ABORT MOUNT', this.name)
//         },
  
//         willMount ({ abort }) {
//           console.log('WILL MOUNT ', this.name);
//         },
  
//         mount () {
//           console.log('MOUNT ', this.name);
//         }
//       }
//     })
//   }

//   console.log('RENDER TEMPLATE');
// }