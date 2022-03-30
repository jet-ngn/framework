import Fragment from './Fragment.js'

export default class Renderer {
  static render (parent, template, options) {
    const fragment = new Fragment(...arguments)
    return fragment.render()
  }
}