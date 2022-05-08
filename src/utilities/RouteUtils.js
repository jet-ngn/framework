export function parseSearch (search) {
  return search
}

export function matchPath (path, routes) {
  const pathSlugs = path.split('/').filter(Boolean)
  
  if (!pathSlugs.length) {
    return routes['/'] ?? null
  }
}