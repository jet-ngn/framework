import Tag from './Tag.js'

function tag (type, strings, ...interpolations) {
  return new Tag({ type, strings, interpolations })
}

export function css () {
  return tag('css', ...arguments)
}

export function html () {
  return tag('html', ...arguments)
}

export function markdown () {
  return tag('markdown', ...arguments)
}

// export function svg (strings, ...interpolations) {
//   return new Tag({
//     type: 'svg',
//     strings,
//     interpolations
//   })
// }
