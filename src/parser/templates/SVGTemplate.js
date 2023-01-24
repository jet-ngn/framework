import Template from './Template'

export default class SVGTemplate extends Template {
  constructor (strings, ...interpolations) {
    super(strings, interpolations, 'svg-template')
  }
}