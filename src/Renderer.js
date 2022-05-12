import Parser from './Parser'
import DOMEventRegistry from './registries/DOMEventRegistry'
import TrackableRegistry from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'
import AttributeList from './AttributeList'
import { generateASTEntry, generateChildren } from './utilities/ASTUtils'

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

export function shouldRetainFormatting (retainFormatting, node) {
  return retainFormatting || !!node.closest('pre')
}

export default class Renderer {
  #parser
  #view
  #config

  constructor (view, config) {
    this.#parser = new Parser(view, config.retainFormatting)
    this.#view = view
    this.#config = config ?? {}
  }

  render (template, ast) {
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

  #renderHTML (template, ast) {
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

    const { retainFormatting } = this.#config

    if (viewConfig) {
      const child = generateASTEntry(this.#view, root, viewConfig)
      root.replaceChildren(generateChildren(child))
      ast.children.push(child)
    } else {
      Object.keys(trackers ?? {}).forEach(id => {
        const placeholder = content.getElementById(id)
        placeholder && trackers[id].render(placeholder, shouldRetainFormatting(retainFormatting, placeholder))
      })

      Object.keys(templates ?? {}).forEach(id => {
        const renderer = new Renderer(this.#view, shouldRetainFormatting(retainFormatting, root))
        const placeholder = content.getElementById(id)
        placeholder && placeholder.replaceWith(renderer.render(templates[id], ast))
      })
    }

    return content
  }

  #renderSVG (template, ast) {
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    target.innerHTML = this.#parser.parse(template)
    const fragment = document.createDocumentFragment()
    fragment.append(...target.children)

    return fragment
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