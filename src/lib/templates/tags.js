import HTMLTemplate from './HTMLTemplate'
import SVGTemplate from './SVGTemplate'
import CSSTemplate from './CSSTemplate'

export function html () {
  return new HTMLTemplate(...arguments)
}

export function svg () {
  return new SVGTemplate('svg', ...arguments)
}

export function css () {
  return new CSSTemplate(...arguments)
}

// export function md (strings, ...interpolations) {
//   return new Template({ type: 'md', strings, interpolations })
// }