import Route from '../Route'

export function combinePaths (...paths) {
  const chunks = paths.map(trimSlashes).filter(Boolean)
  return `/${chunks.join('/')}`
}

export function getSlugs (path) {
  return trimSlashes(path).split('/').filter(Boolean)
}

export function parseSearch (search) {
  return search
}

export function trimSlashes (path) {
  return path.replace(/^\/+|\/+$/g, '')
}