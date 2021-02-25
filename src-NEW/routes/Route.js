export default class Route {
  #name
  #path = null
  #hash = null
  #query = null

  constructor (cfg, name) {
    this.#name = name

    if (typeof cfg === 'string') {
      this.#path = cfg
      return
    }

    this.#path = cfg.path ? this.#validatePath(cfg.path) : null
    this.#hash = cfg.hash ? this.#validateHash(cfg.hash) : null
    this.#query = cfg.query ? this.#validateQuery(cfg.query) : null
  }

  get hash () {
    return this.#hash
  }

  get name () {
    return this.#name
  }

  get path () {
    return this.#path
  }

  get query () {
    return this.#query
  }

  matches (path = '') {
    return this.#path && this.#path === path
  }

  resolve (cfg = {}) {
    cfg = {
      query: this.#query,
      hash: this.#hash,
      ...cfg
    }

    const path = this.resolvePath(cfg.map) + this.resolveQuery(cfg.query) + this.resolveHash(cfg.hash)
    return path.startsWith('/') ? path : `/${path}`
  }

  resolveHash (hash) {
    hash = hash ?? this.#hash
    return !hash ? '' : `#${hash}`
  }

  resolvePath (map) {
    if (!map || !this.path) {
      return this.path ?? ''
    }

    const parts = this.path.split('/').filter(Boolean)

    return '/' + parts.map(part => {
      if (!part.startsWith(':')) {
        return part
      }

      let interp = map[part.substring(1)]

      if (!interp) {
        return console.error(`Route object does not contain a property called "${part.substring(1)}"`)
      }

      return interp
    }).join('/')
  }

  resolveQuery (query) {
    return Object.keys({ ...this.#query, ...query }).map((param, index) => {
      return `${index === 0 ? '?' : '&'}${param}=${query[param]}`
    }).join('')
  }

  toJSON () {
    return {
      route: this.#name,
      path: this.#path,
      hash: this.#hash,
      query: this.#query
    }
  }

  #validatePath = path => {
    if (!path) {
      return null
    }

    if (typeof path !== 'string') {
      throw new TypeError(`Invalid route path. Exected string, received ${NGN.typeof(path)}`)
    }

    return path
  }

  #validateHash = hash => {
    if (!hash) {
      return null
    }

    if (!['string', 'number'].includes(typeof hash)) {
      throw new TypeError(`Invalid route hash. Exected string, received ${NGN.typeof(hash)}`)
    }

    return hash
  }

  #validateQuery = query => {
    if (!query) {
      return {}
    }

    const type = NGN.typeof(query)

    if (type !== 'object') {
      throw new TypeError(`Invalid route query configuration: Expected object, received ${type}`)
    }

    return Object.keys(query).reduce((processed, param) => {
      if (![null, undefined].includes(query[param])) {
        processed[param] = query[param]
      }

      return processed
    }, {})
  }
}
