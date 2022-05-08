import Template from '../Template.js'

export function html (strings, ...interpolations) {
  return new Template({ type: 'html', strings, interpolations })
}

export function svg (strings, ...interpolations) {
  return new Template({ type: 'svg', strings, interpolations })
}

export function css (strings, ...interpolations) {
  return new Template({ type: 'css', strings, interpolations })
}

export function md (strings, ...interpolations) {
  return new Template({ type: 'md', strings, interpolations })
}