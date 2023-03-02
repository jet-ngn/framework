import HTMLTemplate from './HTMLTemplate'
// import SVGTemplate from './templates/SVGTemplate'
// import CSSTemplate from './templates/CSSTemplate'

export function html (strings, ...interpolations) {
  return new HTMLTemplate(...arguments)
}

// export function svg () {
//   return new SVGTemplate(...arguments)
// }

// export function css () {
//   return new CSSTemplate(...arguments)
// }

// export function md (strings, ...interpolations) {
//   return new Template({ type: 'md', strings, interpolations })
// }