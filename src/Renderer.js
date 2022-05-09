import View from './View'
import Parser from './Parser'
import Route from './Route'
import DefaultRoutes from './lib/routes'
import { matchPath } from './utilities/RouteUtils'

function generateRoutes (routes, baseURL) {
  return Object.keys(routes ?? {}).reduce((result, route) => {
    if (!result) {
      result = {}
    }

    const config = routes[route]
    route = route.trim()
    result[route] = new Route(new URL(route, baseURL), config)
    return result
  }, null)
}

function get404 (view, routes) {
  return !!routes?.[404]
    ? Reflect.get(routes[404], 'template', view)
    : Reflect.get(DefaultRoutes[404], 'template', view)
}

export function getViewContent (view, cfg, { baseURL, path, retainFormatting }) {
  const renderer = new Renderer(view, retainFormatting)
  const routes = generateRoutes(cfg.routes, baseURL)
  let content

  function render (template) {
    if (!template) {
      return
    }

    const result = renderer.render(template, path, baseURL)
    content = result.content
    path = result.remaining
  }

  render(Reflect.get(cfg, 'template', view))

  if (!!path && routes) {
    const { route, remaining } = matchPath(path, routes)
    path = remaining

    if (route) {
      const { config } = route
      const result = getViewContent(new View(view, view.root, config), config, { baseURL, path, retainFormatting })
      content = result.content
      path = result.remaining
    } else {
      render(get404(view, routes))
    }
  }

  if (!!path && path !== '/') {
    render(get404(view, routes))
  }

  return { content, remaining: path }
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

  #renderHTML (template, path, baseURL) {
    const parser = new Parser(this.#retainFormatting)
    const target = document.createElement('template')
    target.innerHTML = parser.parse(template)

    const { content } = target
    const root = content.firstElementChild
    const { templates } = parser
    const { viewConfig } = template

    if (viewConfig) {
      const view = new View(this.#parent, root, viewConfig)
      
      const result = getViewContent(view, viewConfig, {
        baseURL,
        path,
        retainFormatting: this.#retainFormatting
      })
      
      root.replaceChildren(result.content)
      path = result.remaining
    } else {
      // Recurse
      Object.keys(templates).forEach(template => {
        const result = this.render(templates[template], path, baseURL)
        content.getElementById(template).replaceWith(result.content)
        path = result.remaining
      })
    }

    return { content, remaining: path }
  }

  #renderSVG () {
    console.log('RENDER SVG')
  }
}