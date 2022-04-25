export function matchRoute (path, routes) {
  return routes.reduce((result, route) => {
    result = route === path ? path : path.startsWith(route) ? route : result
    return result
  }, null)
}

export function resolveRoute (path, map) {
  if (!map) {
    return path ?? ''
  }

  const parts = path.split('/').filter(Boolean)

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