import Parser from './Parser'
import DOMEventRegistry from './DOMEventRegistry.js'
import RouterRegistry from './RouterRegistry.js'
import TrackableRegistry from './TrackableRegistry.js'
import ViewRegistry from './ViewRegistry.js'
import TrackingInterpolation from './TrackingInterpolation.js'
import AttributeList from './AttributeList.js'

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

export function getOptions (options, node) {
  return {
    retainFormatting: options.retainFormatting || !!node.closest('pre')
  }
}

export function renderTemplate (view, template) {
  const renderer = new Renderer(view, { retainFormatting: view.root.tagName === 'PRE' })
  return renderer.render(template)
}

export default class Renderer {
  #view
  #parser
  #options

  constructor (view, options) {
    this.#view = view
    this.#options = options
    this.#parser = new Parser(view)
  }

  render (template, isChild = false) {
    if (Array.isArray(template)) {
      return console.log('Render Array of Templates')
    }

    switch (template.type) {
      case 'html': return this.#renderHTML(...arguments)
      case 'svg': return console.log(`RENDER SVG`)
      default: throw new TypeError(`Invalid template type "${template.type}"`)
    }
  }

  #renderChild (content, child, callback) {
    return callback(child, content.getElementById(child.id))
  }

  #renderCollection (content, collection, callback) {
    for (let item of collection) {
      this.#renderChild(content, item, callback)
    }
  }

  #bind (item, node, hasMoreThanOneNode, cb) {
    if (!node) {
      throw new Error(`Cannot bind ${item} to non-element nodes`)
    }

    if (hasMoreThanOneNode) {
      throw new Error(`Cannot bind ${item} to more than one node`)
    }

    cb()
  }

  #renderHTML (template, isChild = false) {
    const target = document.createElement('template')
    target.innerHTML = this.#parser.parse(template, this.#options)

    const { content } = target
    const { attributes, bound, listeners } = template
    const node = content.firstElementChild
    const hasMoreThanOneNode = content.children.length > 1

    if (!!attributes) {
      this.#bind('attributes', node, hasMoreThanOneNode, () => {
        for (let attribute in attributes ?? {}) {
          this.#setAttribute(node, attribute, attributes[attribute])
        }
      })
    }

    if (!!listeners) {
      this.#bind('listeners', node, hasMoreThanOneNode, () => {
        for (let evt in listeners ?? {}) {
          listeners[evt].forEach(({ handler, cfg }) => DOMEventRegistry.add(this, node, evt, handler, cfg))
        }
      })
    }

    const { interpolations, templates, trackers } = this.#parser

    this.#renderCollection(content, interpolations, (interpolation, placeholder) => {
      placeholder?.replaceWith(interpolation.render(getOptions(this.#options, placeholder)))
    })

    this.#renderCollection(content, trackers, (tracker, placeholder) => {
      placeholder && tracker?.render(placeholder, getOptions(this.#options, placeholder))
    })

    this.#renderCollection(content, templates, (template, placeholder) => {
      if (placeholder) {
        const renderer = new Renderer(this.#view, getOptions(this.#options, placeholder))
        const content = renderer.render(template, true)
        placeholder?.replaceWith(content)
      }
    })

    if (!!bound.view) {
      this.#bind('view', node, hasMoreThanOneNode, () => {
        if (!isChild) {
          this.#view.children.length = 0
        }

        if (bound.view instanceof TrackingInterpolation) {
          const tracker = TrackableRegistry.registerBindingTracker(node, bound.view, this.#view, bound)
          bound.view = tracker.value
        }

        const child = ViewRegistry.register({
          parent: this.#view,
          root: node,
          config: bound.view,
          options: bound
        })

        this.#view.children.push(child.view)
        // tasks.push(path => {
        //   const { view, mount } = ViewRegistry.register({
        //     parent: this.#view,
        //     root: node,
        //     config: bound.view,
        //     options: bound
        //   })
  
        //   this.#view.children.push(view)
        //   mount(path)
        // })
      })
    }

    return content
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