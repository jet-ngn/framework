import { Path } from '../env'
import { getRouteSlugs } from './RouteManager'

export default class Router {
  static get base () {
    return Path.base
  }

  static get path () {
    const { pathname } = location
    const base = Path.base.pathname
    return base === '/' ? pathname : pathname.replace(base, '')
  }

  static get vars () {
    return { ...(Path.vars ?? {}) }
  }

  static pathMatches (path) {
    const slugs = getRouteSlugs(path)
    const locationSlugs = getRouteSlugs(location.pathname)
    return locationSlugs.every((slug, i) => slug === slugs[i])
  }
}