import Parser from './Parser'
import DOMEventRegistry from './DOMEventRegistry.js'
import EntityRegistry from './EntityRegistry.js'
import TrackingInterpolation from './TrackingInterpolation.js'

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

export function getOptions (options, node) {
  return {
    retainFormatting: options.retainFormatting || !!node.closest('pre')
  }
}

export default class Renderer {
  #parent
  #parser
  #options

  constructor (parent, options) {
    this.#parent = parent
    this.#options = options
    this.#parser = new Parser(parent)
  }

  render (template, tasks, isChild) {
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

  #renderHTML (template, tasks = [], isChild = false) {
    const target = document.createElement('template')
    target.innerHTML = this.#parser.parse(template, this.#options)

    const { content } = target
    const node = content.firstElementChild
    const hasMoreThanOneNode = content.children.length > 1

    const { attributes, bound, listeners } = template

    if (!!attributes) {
      this.#bind('attributes', node, hasMoreThanOneNode, () => {
        for (let attribute in attributes) {
          this.#setAttribute(node, attribute, attributes[attribute])
        }
      })
    }

    if (!!listeners) {
      this.#bind('listeners', node, hasMoreThanOneNode, () => {
        for (let evt in listeners) {
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
        const renderer = new Renderer(this.#parent, getOptions(this.#options, placeholder))
        const { content } = renderer.render(template, tasks, true)
        placeholder?.replaceWith(content)
      }
    })



    return { content, tasks }

    // if (!!route && routes.length > 0) {
    //   const { config, remaining } = template.routes.match(route)

    //   const renderer = new Renderer(this.#parent, getOptions(this.#options, placeholder))
    //   const { content } = renderer.render(template, { isChild: true, route }, tasks)
    //   placeholder?.replaceWith(content)
    //   console.log('RENDER', config)
    //   console.log(root);

    //   route = remaining
    // } else {
    //   


    

    

    //   if (bound.config) {
    //     if (content.childElementCount > 1) {
    //       throw new Error(`Cannot bind entity to more than one node`)
    //     }

    //     if (!isChild) {
    //       this.#parent.children.length = 0
    //     }

    //     // if (entityConfig instanceof TrackingInterpolation) {
    //     //   const tracker = TrackableRegistry.registerBindingTracker(node, bound.config, this.#parent, bound)
    //     //   config = tracker.value
    //     // }

    //     tasks.push(() => {
    //       const { entity, mount } = EntityRegistry.register({
    //         parent: this.#parent,
    //         root: node,
    //         config: bound.config,
    //         options: bound
    //       })

    //       this.#parent.children.push(entity)
    //       mount(route)
    //     })
    //   }
    // }

    return { content, tasks }
  }

  #setAttribute (node, name, value) {
    if (value instanceof TrackingInterpolation) {
      const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#parent)
      return tracker.reconcile()
    }

    const existing = getExistingAttributeValue(node, name)

    if (Array.isArray(value)) {
      const list = new AttributeList(node, name, value.concat(...(existing ?? [])), this.#parent)
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

      default: throw new TypeError(`"${this.#parent.name}" rendering error: Invalid attribute value type "${typeof value}"`)
    }
  }
}