import View from './View'
import Parser from './Parser'
import Route from './Route'
import DefaultRoutes from './lib/routes'
import DOMEventRegistry from './registries/DOMEventRegistry'
import TrackableRegistry from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'
import AttributeList from './AttributeList'
import { matchPath } from './utilities/RouteUtils'
import { INTERNAL_ACCESS_KEY } from './globals'

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
    ? Reflect.get(routes[404].config, 'template', view)
    : Reflect.get(DefaultRoutes[404], 'template', view)
}

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

export function shouldRetainFormatting (retainFormatting, node) {
  return retainFormatting || !!node.closest('pre')
}

export function getViewContent (view, cfg, { baseURL, path, retainFormatting }, tasks) {
  const renderer = new Renderer(view, retainFormatting)
  const routes = generateRoutes(cfg.routes, baseURL)
  let content

  function render (template) {
    if (!template) {
      return
    }

    const result = renderer.render(template, path, baseURL, tasks)
    content = result.content
    path = result.remaining
  }

  render(Reflect.get(cfg, 'template', view))

  if (!!path && !!routes) {
    const { route, remaining } = matchPath(path, routes)
    path = remaining

    if (route) {
      const { config } = route
      const child = new View(view, view.root, config)
      const result = getViewContent(child, config, { baseURL, path, retainFormatting }, tasks)
      content = result.content
      path = result.remaining
      tasks.push(() => view.emit(INTERNAL_ACCESS_KEY, 'route.change', {
        from: 'FIX THIS',
        to: route
      }))
    } else {
      render(get404(view, routes))
    }
  }
  
  if (!!routes && !!path && path !== '/') {
    render(get404(view, routes))
  }

  tasks.push(() => view.emit(INTERNAL_ACCESS_KEY, 'mount'))
  return { content, remaining: path }
}

export default class Renderer {
  #parser
  #view
  #retainFormatting

  constructor (view, retainFormatting) {
    this.#parser = new Parser(this.#view, this.#retainFormatting)
    this.#view = view
    this.#retainFormatting = retainFormatting
  }

  render (template, path, baseURL, tasks) {
    if (Array.isArray(template)) {
      return console.log('Render Array of Templates')
    }

    switch (template.type) {
      case 'html': return this.#renderHTML(...arguments)
      case 'svg': return this.#renderSVG(...arguments)
      default: throw new TypeError(`Invalid template type "${template.type}"`)
    }
  }

  #bind (item, node, hasMultipleRoots, cb) {
    if (!node) {
      throw new Error(`Cannot bind ${item} to non-element nodes`)
    }

    if (hasMultipleRoots) {
      throw new Error(`Cannot bind ${item} to more than one node`)
    }

    cb()
  }

  #renderHTML (template, path, baseURL, tasks) {
    const target = document.createElement('template')
    target.innerHTML = this.#parser.parse(template)

    const { content } = target
    const root = content.firstElementChild
    const hasMultipleRoots = content.children.length > 1
    const { templates, trackers } = this.#parser
    const { attributes, listeners, viewConfig } = template

    if (!!attributes) {
      this.#bind('attributes', root, hasMultipleRoots, () => {
        for (let attribute in attributes ?? {}) {
          this.#setAttribute(root, attribute, attributes[attribute])
        }
      })
    }

    if (!!listeners) {
      this.#bind('listeners', root, hasMultipleRoots, () => {
        for (let evt in listeners ?? {}) {
          listeners[evt].forEach(({ handler, cfg }) => DOMEventRegistry.add(this.#view, root, evt, handler, cfg))
        }
      })
    }

    if (viewConfig) {
      const view = new View(this.#view, root, viewConfig)
      
      const result = getViewContent(view, viewConfig, {
        baseURL,
        path,
        retainFormatting: this.#retainFormatting
      }, tasks)
      
      root.replaceChildren(result.content)
      path = result.remaining
    } else {
      Object.keys(trackers ?? {}).forEach(id => {
        const placeholder = content.getElementById(id)

        if (placeholder) {
          path = trackers[id].render(placeholder, shouldRetainFormatting(this.#retainFormatting, placeholder), path, baseURL)
        }
      })

      Object.keys(templates ?? {}).forEach(id => {
        const renderer = new Renderer(this.#view, shouldRetainFormatting(this.#retainFormatting, root))
        const result = renderer.render(templates[id], path, baseURL, tasks)
        const placeholder = content.getElementById(id)
        placeholder && placeholder.replaceWith(result.content)
        path = result.remaining
      })
    }

    return { content, remaining: path }
  }

  #renderSVG (template, path, baseURL, tasks) {
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    target.innerHTML = this.#parser.parse(template)
    const fragment = document.createDocumentFragment()
    fragment.append(...target.children)

    return { content: fragment, remaining: path }
  }

  #setAttribute (node, name, value) {
    if (value instanceof TrackingInterpolation) {
      const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#view)
      return tracker.reconcile()
    }

    const existing = getExistingAttributeValue(node, name)

    if (Array.isArray(value)) {
      const list = new AttributeList(node, name, value.concat(...(existing ?? [])), this.#view)
      return node.setAttribute(name, list.value)
    }

    switch (typeof value) {
      case 'string':
      case 'number': return node.setAttribute(name, `${existing.join(' ')} ${value}`.trim())
      case 'boolean': return value && node.setAttribute(name, '')
      
      case 'object': return Object.keys(value).forEach(slug => {
        name = `${name}-${slug}`
        const existing = getExistingAttributeValue(node, name)
        return this.#setAttribute(node, name, `${existing.join(' ')} ${value[slug]}`.trim())
      })

      default: throw new TypeError(`"${this.#view.name}" rendering error: Invalid attribute value type "${typeof value}"`)
    }
  }
}