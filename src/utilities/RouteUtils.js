export function combinePaths (...paths) {
  const chunks = paths.map(trimSlashes).filter(Boolean)
  return `/${chunks.join('/')}`
}

export function getSlugs (path) {
  return trimSlashes(path).split('/').filter(Boolean)
}

export function matchPath (path, routes) {
  const pathSlugs = getSlugs(path)

  if (!pathSlugs.length) {
    return { route: routes['/'] ?? null, remaining: '/' }
  }

  let bestScore = -1

  return Object.keys(routes ?? {}).reduce((match, route) => {
    const routeSlugs = getSlugs(route)
    const scores = new Array(routeSlugs.length).fill(0)
    const neededScore = routeSlugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
    const props = {}

    if (neededScore >= bestScore) {
      pathSlugs.forEach((pathSlug, i) => {
        const routeSlug = routeSlugs[i]
  
        if (scores.length >= i + 1) {
          if (routeSlug?.startsWith(':')) {
            scores[i] = 1
            props[routeSlug.substring(1)] = pathSlug
          } else {
            scores[i] = pathSlug === routeSlug ? 2 : 0
          }
        }
      })
  
      const finalScore = scores.reduce((result, score) => result += score, 0)
      
      if (finalScore === neededScore && finalScore > bestScore) {
        bestScore = finalScore
        match.route = routes[route]
        let remainingSlugs = pathSlugs.slice(routeSlugs.length)
        match.remaining = remainingSlugs.length === 0 ? '' : `/${remainingSlugs.join('/')}`
      }
    }

    return match
  }, {
    route: null,
    remaining: path
  })
}

export function parseSearch (search) {
  return search
}

export function trimSlashes (path) {
  return path.replace(/^\/+|\/+$/g, '')
}