// import { PATH } from '../../env'

// export function getMatchingRoute (routes = {}, { base = null, exact = false } = {}) {
//   if (!!base) {
//     if (base === '/') {
//       base = ''
//     }

//     routes = Object.keys(routes).reduce((result, route) => ({
//       ...result,
//       [`${base}${route}`]: routes[route]
//     }), {})
//   }

//   routes = parseRoutes(routes)

//   if (PATH.remaining.length === 0) {
//     const defaultRoute = routes['/'] ?? null
    
//     return defaultRoute ? {
//       ...defaultRoute,
//       vars: {}
//     } : null
//   }

//   const max = getScore(PATH.remaining)
//   let match = null
//   let current = 0
  
//   for (let route of Object.values(routes)) {
//     const { slugs, value } = route
//     const scores = new Array(slugs.length).fill(0)
//     const vars = {}

//     if (exact && value !== max) {
//       continue
//     }

//     if (value < current) {
//       continue
//     }

//     for (let [i, slug] of PATH.remaining.entries()) {
//       const routeSlug = slugs[i]
      
//       if (!routeSlug) {
//         break
//       }

//       if (routeSlug.startsWith(':')) {
//         scores[i] = 1
//         vars[routeSlug.substring(1)] = slug
//       } else {
//         scores[i] = routeSlug === slug ? 2 : 0
//       }
//     }
    
//     const finalScore = getScore(scores)

//     if (finalScore === value && finalScore > current) {
//       current = finalScore

//       match = {
//         ...route,
//         vars
//       }
//     }
//   }

//   PATH.remaining = PATH.remaining.slice(match?.slugs.length ?? 0)
//   return match
// }

// export function getRouteSlugs (path) {
//   return path?.trim().split('/').filter(Boolean) ?? []
// }

// function getScore (slugs) {
//   return slugs.reduce((total, slug) => {
//     return total + (
//       typeof slug === 'number'
//         ? slug
//         : slug.startsWith(':')
//           ? 1 
//           : 2
//     )
//   }, 0)
// }

// function parseRoutes (routes) {
//   return Object.keys(routes ?? {}).reduce((result, route) => {
//     route = route.trim()
//     const url = new URL(route, PATH.base)
//     const slugs = getRouteSlugs(url.pathname)

//     return {
//       ...(result ?? {}),
//       [route]: {
//         url,
//         slugs,
//         value: getScore(slugs),
//         config: routes[route]
//       }
//     }
//   }, {})
// }