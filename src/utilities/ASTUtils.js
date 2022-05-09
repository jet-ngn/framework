import Route from '../Route'

export function generateASTEntry (routes, baseURL) {
  return {
    children: new Map,
    routes: generateRoutes(...arguments)
  }
}

function generateRoutes (routes, baseURL, prefix = '') {
  return Object.keys(routes ?? {}).reduce((result, route) => {
    if (!result) {
      result = {}
    }

    const config = routes[route]
    route = `${prefix ? prefix === '/' ? '' : prefix : ''}${route.trim()}`
    result[route] = new Route(new URL(route, baseURL), config)

    if (config.hasOwnProperty('routes')) {
      result = {
        ...result,
        ...generateRoutes(config.routes, baseURL, route)
      }
    }

    return result
  }, null)
}