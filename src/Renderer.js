import View from './View'
import Parser from './Parser'
import Route from './Route'

export function initializeView (view, config, baseURL) {
  const renderer = new Renderer(view, view.root.tagName === 'PRE')
  return renderer.render(Reflect.get(config, 'template', view), baseURL, data.children)
}

export default class Renderer {
  #parent
  #retainFormatting

  constructor (parent, retainFormatting) {
    this.#parent = parent
    this.#retainFormatting = retainFormatting
  }

  render (template, baseURL, children) {
    if (Array.isArray(template)) {
      return console.log('Render Array of Templates')
    }

    switch (template.type) {
      case 'html': return this.#renderHTML(...arguments)
      case 'svg': return this.#renderSVG(...arguments)
      default: throw new TypeError(`Invalid template type "${template.type}"`)
    }
  }

  #processChildView (root, config, baseURL, children) {
    const view = new View(this.#parent, root, config)
    children.set(view, {})
    return initializeView(view, config, baseURL, children.get(view))
  }

  #renderHTML (template, baseURL, children) {
    const parser = new Parser(this.#retainFormatting)
    const target = document.createElement('template')
    target.innerHTML = parser.parse(template)

    const { content } = target
    const root = content.firstElementChild
    const { templates } = parser
    
    // Recurse
    Object.keys(templates).forEach(template => {
      content.getElementById(template).replaceWith(this.render(templates[template], baseURL, children))
    })

    const { view } = template

    if (view) {
      root.replaceChildren(this.#processChildView(root, view, baseURL, children))
    }

    return content
  }

  #renderSVG () {
    console.log('RENDER SVG')
  }
}