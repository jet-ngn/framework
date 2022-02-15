import Tag from './Tag.js'

function tag (type, template, ...interpolations) {
  return new Tag({ type, template, interpolations })
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

export function svg () {
  return tag('svg', ...arguments)
}