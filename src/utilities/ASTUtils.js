import Route from '../Route'

export function generateEntry (config, baseURL) {
  return {
    children: new Map,

    routes: Object.keys(config.routes ?? {}).reduce((result, route) => {
      if (!result) {
        result = {}
      }
  
      result[route.trim()] = new Route(new URL(route, baseURL), config.routes[route])
      return result
    }, null)
  }
}