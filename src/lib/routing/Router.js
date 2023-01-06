import { Path } from '../../env'

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
}