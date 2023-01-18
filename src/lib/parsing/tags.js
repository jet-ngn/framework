import HTMLTemplate from './templates/HTMLTemplate'
import SVGTemplate from './templates/SVGTemplate'
import CSSTemplate from './templates/CSSTemplate'

export function html () {
  return new HTMLTemplate(...arguments)
}

export function svg () {
  return new SVGTemplate(...arguments)
}

export function css () {
  return new CSSTemplate(...arguments)
}

// export function md (strings, ...interpolations) {
//   return new Template({ type: 'md', strings, interpolations })
// }