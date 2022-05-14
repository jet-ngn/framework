import Renderer from '../Renderer'
import View from '../View'
import Route from '../Route'
import DefaultRoutes from '../lib/routes'
import { matchPath } from './RouteUtils'
import { APP } from '../env'

function generateRoutes (routes) {
  return Object.keys(routes ?? {}).reduce((result, route) => {
    if (!result) {
      result = {}
    }

    const config = routes[route]
    route = route.trim()
    result[route] = new Route(new URL(route, APP.base), config)
    return result
  }, null)
}

// const template = Reflect.get(config, 'template', view)
  // const renderer = new Renderer(view, { retainFormatting: root.tagName === 'PRE' })

export function generateAST (root, config) {
  const view = new View(null, root, config)
  let template 

  const ast = {
    view,
    template,
    routes: generateRoutes(config.routes),
    children: []
  }

  // ast.content = renderer.render(template, ast)
  return ast
}

// export function generateASTEntry (parent, node, config) {
//   return {
//     parent,
//     view: new View(parent, node, config),
//     config,
//     children: [],
//     routes: generateRoutes(config.routes),
//     activeRoute: null
//   }
// }

// function renderTemplate (renderer, template, ast) {
//   return template ? renderer.render(template, ast) : null
// }

// export function generateChildren (ast, isRoot = false) {
//   const { config, routes, view } = ast
//   const { root } = view
//   const renderer = new Renderer(view, { retainFormatting: root.tagName === 'PRE' })
//   let content = renderTemplate(renderer, Reflect.get(config, 'template', view), ast)

//   // Check if there is a matching route

//   // If so, render that and return

//   // If not, check children for a matching route

//   return content
// }

// // function render404 () {
// //   const custom = routes?.[404]
// //   child = generateASTEntry(view, root, custom && custom.hasOwnProperty('template') ?? DefaultRoutes[404])
// //   const template = Reflect.get(child.config, 'template', view)
// //   return template ? renderTemplate(renderer, template, ast)
// // }

// // isRoot && console.log('IS ROOT')
// // console.log('PATH', APP.remainingPath);

// // if (APP.remainingPath) {
// //   console.log('THERE IS PATH REMAINING. CHECK ROUTES')

// //   if (routes) {
// //     console.log('VIEW HAS ROUTES.')
// //     const match = matchPath(APP.remainingPath, routes)

// //     if (match) {
// //       console.log('MATCHED', match)
// //       child = generateASTEntry(view, root, match.config)
// //       ast.activeRoute = match
// //       APP.matchedRoutes.push(match)
// //       APP.currentRoute = match
// //       return generateChildren(child)

// //     } else {
// //       console.log('NO MATCH. RENDER 404')
// //       return render404(view, root, routes, ast)

// //       // if (!content) {
// //       //   console.log('...AND THERE IS NO TEMPLATE. RENDER 404')
        
// //       // }
// //     }
// //   } else {
// //     console.log('VIEW DOES NOT HAVE ROUTES')

// //     if (!content) {
// //       console.log('...OR A TEMPLATE. RENDER 404')
// //       return render404(view, root, routes, ast)
// //     }
// //   }
// // } else {
// //   console.log('THERE IS NO PATH REMAINING. CHECK TEMPLATE')

// //   if (!content) {
// //     console.log('THERE IS NO TEMPLATE. RENDER 404')
// //     return render404(view, root, routes, ast)
// //   }
// // }

// // // if (routes) {
// // //   console.log('HAS ROUTES')
// // //   const match = matchPath(APP.remainingPath, routes)

// // //   if (match) {
// // //     console.log('MATCHED', match)
// // //     child = generateASTEntry(view, root, match.config)
// // //     ast.activeRoute = match
// // //     APP.matchedRoutes.push(match)
// // //     APP.currentRoute = match
// // //     content = generateChildren(child)
    
// // //   } else {
// // //     console.log('DID NOT MATCH.')

// // //     if (!content) {
// // //       console.log('NO TEMPLATE. RENDER 404')
// // //       generate404()
// // //     }
// // //   }
// // // } else {
// // //   console.log('DOES NOT HAVE ROUTES')

// // //   if (APP.remainingPath === '/') {
// // //     console.log('PATH IS /. RENDER TEMPLATE')

// // //     if (!content) {
// // //       console.log('THERE IS NO TEMPLATE. RENDER NOTHING')
// // //       content = ''
// // //     }
// // //   }
// // // }

// // return content





// // export function generateChildren (ast) {
// //   const { node, config, routes, view } = ast
// //   const renderer = new Renderer(view, { retainFormatting: node.tagName === 'PRE' })
// //   let content = renderTemplate(renderer, Reflect.get(config, 'template', view), ast)
// //   let child

// //   function generate404 () {
// //     child = generateASTEntry(view, node, routes?.[404] ?? DefaultRoutes[404])
// //     const template = Reflect.get(child.config, 'template', view)
// //     content = template ? renderTemplate(renderer, template, ast) : content
// //   }

// //   if (!!routes && !!APP.remainingPath) {
// //     const match = matchPath(APP.remainingPath, routes)

// //     if (match) {
// //       child = generateASTEntry(view, node, match.config)
// //       ast.activeRoute = match
// //       APP.currentRoute = match
// //       content = generateChildren(child)
// //     } else {
// //       generate404()
// //     }

// //     if (!!APP.remainingPath && !!APP.remainingPath !== '/') {
// //       generate404()
// //     }
// //   }

// //   // if (!!APP.remainingPath && APP.remainingPath !== '/') {
// //   //   generate404()
// //   // }

// //   child && ast.children.push(child)
// //   return content
// // }