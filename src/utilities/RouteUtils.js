import { PATH } from '../env'

export function combinePaths (...paths) {
  const chunks = paths.map(trimSlashes).filter(Boolean)
  return `/${chunks.join('/')}`
}

export function getNeededScore (path) {
  return getSlugs(path ?? '').reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
}

export function getSlugs (path) {
  return trimSlashes(path).split('/').filter(Boolean)
}

export function parseRoutes (routes) {
  return Object.keys(routes).reduce((result, route) => {
    route = route.trim()

    return {
      ...(result ?? {}),
      [route]: {
        url: new URL(route, PATH.base),
        config: routes[route]
      }
    }
  }, null)
}

export function parseSearch (search) {
  return search
}

export function trimSlashes (path) {
  return path.replace(/^\/+|\/+$/g, '')
}