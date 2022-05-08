export function parseSearchParams (params) {
  return [...(new URLSearchParams(params).entries())].reduce((result, [key, value]) => {
    result[key] = value === 'true' ? true : value === 'false' ? false : value
    return result
  }, {})
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