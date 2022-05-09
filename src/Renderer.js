import View from './View'
import Parser from './Parser'
// import Route from './Route'
import { getViewContent } from './App'
import { html } from './lib/tags'
import { generateASTEntry } from './utilities/ASTUtils'

export function renderView (view, config, baseURL, data) {
  const renderer = new Renderer(view, view.root.tagName === 'PRE')
  return renderer.render(Reflect.get(config, 'template', view) ?? html``, baseURL, data)
}

export default class Renderer {
  #parent
  #retainFormatting

  constructor (parent, retainFormatting) {
    this.#parent = parent
    this.#retainFormatting = retainFormatting
  }

  render (template, baseURL) {
    if (Array.isArray(template)) {
      return console.log('Render Array of Templates')
    }

    switch (template.type) {
      case 'html': return this.#renderHTML(...arguments)
      case 'svg': return this.#renderSVG(...arguments)
      default: throw new TypeError(`Invalid template type "${template.type}"`)
    }
  }

  // #processChildView (root, config, baseURL, data) {
  //   const view = new View(this.#parent, root, config)
  //   data.children.set(view, generateASTEntry(config.routes, baseURL))
  //   return renderView(view, config, baseURL, data.children.get(view))
  // }

  #initializeChildView (root, config, baseURL, data) {
    initializeView(view, config, baseURL, path)
  }

  #renderHTML (template, path, baseURL) {
    const parser = new Parser(this.#retainFormatting)
    const target = document.createElement('template')
    target.innerHTML = parser.parse(template)

    const { content } = target
    const root = content.firstElementChild
    const { templates } = parser
    
    // Recurse
    Object.keys(templates).forEach(template => {
      content.getElementById(template).replaceWith(this.render(templates[template], path, baseURL))
    })

    let { viewConfig } = template

    if (viewConfig) {
      const view = new View(this.#parent, root, viewConfig)
      root.replaceChildren(getViewContent(view, viewConfig, { baseURL, path, retainFormatting: this.#retainFormatting }))
    }

    return content
  }

  #renderSVG () {
    console.log('RENDER SVG')
  }
}