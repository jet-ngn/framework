import Template from '../Template.js'

export function html () {
  return new Template('html', ...arguments)
}

export function svg () {
  return new Template('svg', ...arguments)
}

// export function css (strings, ...interpolations) {
//   return new Template({ type: 'css', strings, interpolations })
// }

// export function md (strings, ...interpolations) {
//   return new Template({ type: 'md', strings, interpolations })
// }