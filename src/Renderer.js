import Parser from './Parser.js'
import Entity from './Entity.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import EntityRegistry from './registries/EntityRegistry.js'
import { TrackingInterpolation } from './Interpolation.js'
import { typeOf } from '@ngnjs/libdata'

export default class Renderer {
  #parent
  #parser = new Parser
  #options

  constructor (parent, options) {
    this.#parent = parent
    this.#options = options
  }

  async render (template, isChild = false) {
    const { attributes, entityConfig, listeners, type } = template

    const target = type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    target.innerHTML = this.#parser.parse(template)

    const { content } = target
    const nodes = [...content.children]

    if (!!attributes) {
      this.#bindAttributes(nodes, attributes)
    }

    if (!!listeners) {
      this.#bindListeners(nodes, listeners)
    }

    const { interpolations, templates, trackers } = this.#parser

    await this.#renderCollection(content, interpolations, (interpolation, placeholder) => {
      placeholder?.replaceWith(interpolation.render(this.#getOptions(placeholder)))
    })

    // // this.#renderCollection(content, trackers, (tracker, placeholder) => {
    // //   placeholder && tracker?.render(this, placeholder, this.#manages, this.#getOptions(placeholder))
    // // })

    await this.#renderCollection(content, templates, async (template, placeholder) => {
      if (placeholder) {
        const renderer = new Renderer(this.#parent, this.#getOptions(placeholder))
        placeholder.replaceWith(await renderer.render(template, true))
      }
    })

    if (entityConfig) {
      if (content.childElementCount > 1) {
        throw new Error(`Cannot bind entity to more than one node`)
      }

      // This shouldn't be necessary as any child entities will never have the chance to mount
      // for (let child of children) {
      //   await EntityRegistry.unmount(child.id)
      // }

      if (!isChild) {
        this.#parent.children.length = 0
      }

      const entity = new Entity(content.firstElementChild, entityConfig, this.#parent)
      await EntityRegistry.register(entity)
      this.#parent.children.push(entity)
    }

    return content
  }

  #bindAttributes (nodes, attributes) {
    if (nodes.length === 0) {
      throw new Error(`Cannot bind attributes to non-element nodes`)
    }

    if (nodes.length > 1) {
      throw new Error(`Cannot bind attributes to more than one node`)
    }

    const node = nodes[0]

    for (let attribute in attributes) {
      this.#setAttribute(node, attribute, attributes[attribute])
    }
  }

  #bindListeners (nodes, listeners) {
    if (nodes.length === 0) {
      throw new Error(`Cannot bind event listeners to non-element nodes`)
    }

    if (nodes.length > 1) {
      throw new Error(`Cannot bind event listeners to more than one node`)
    }

    for (let evt in listeners) {
      listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(this, nodes[0], evt, handler, cfg))
    }
  }

  #getOptions (node) {
    return {
      retainFormatting: this.#options.retainFormatting || !!node.closest('pre')
    }
  }

  async #renderChild (content, child, callback) {
    return await callback(child, content.getElementById(child.id))
  }

  async #renderCollection (content, collection, callback) {
    for (let item of collection) {
      await this.#renderChild(content, item, callback)
    }
  }

  #setAttribute (node, name, value) {
    if (Array.isArray(value)) {
      const list = processList(value)
      return node.setAttribute(name, list.join(' '))
    }

    if (value instanceof TrackingInterpolation) {
      return console.log('HANDLE ATTRIBUTE TRACKER')
    }

    let type = typeOf(value)

    switch (type) {
      case 'string':
      case 'number': return node.setAttribute(name, value)
      case 'boolean': return value && node.setAttribute(name, '')
      case 'object': return Object.keys(value).forEach(slug => this.#setAttribute(node, `${name}-${slug}`, value[slug]))
      default: throw new TypeError(`"${this.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
    }
  }
}

// class Renderer {
//   #root
//   #template
//   #manages = []
//   #options
//   #parent
//   #replace

//   constructor (root, cfg, parent, replace = false) {
//     this.#parent = parent ?? null
//     this.#template = Reflect.get(cfg, 'template', this) ?? html``
//     this.#root = new Node(root)
//     this.#replace = replace === true
    
//     this.#options = {
//       retainFormatting: this.#root.tagName === 'PRE'
//     }

//     this.#render()
//   }

//   get manages () {
//     return this.#manages.length > 0 ? this.#manages : null
//   }

//   get parent () {
//     return this.#parent
//   }

//   get root () {
//     return this.#root
//   }

//   #render () {
//     const parser = new Parser()
//     const { attributes, entityConfig, listeners, type } = this.#template

//     const target = type === 'svg'
//       ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
//       : document.createElement('template')

//     target.innerHTML = parser.parse(this.#template)

//     const { content } = target
//     const nodes = [...content.children]

//     if (!!attributes) {
//       this.#bindAttributes(nodes, attributes)
//     }

//     // if (!!listeners) {
//     //   this.#bindListeners(nodes, listeners)
//     // }

//     // this.#populateTemplate(this.#template, parser)

//     const { interpolations, templates, trackers } = parser

//     this.#renderCollection(content, interpolations, (interpolation, placeholder) => {
//       placeholder?.replaceWith(interpolation.render(this.#getOptions(placeholder)))
//     })

//     // this.#renderCollection(content, trackers, (tracker, placeholder) => {
//     //   placeholder && tracker?.render(this, placeholder, this.#manages, this.#getOptions(placeholder))
//     // })

//     this.#renderCollection(content, templates, (template, placeholder) => {
//       const renderer = new Entity(placeholder, { template }, this, true)
//       // this.#manages.push(...renderer.manages)
//       console.log(this)
//     })

//     if (entityConfig) {
//       if (content.childElementCount > 1) {
//         throw new Error(`Cannot bind entity to more than one node`)
//       }
  
//       this.#manages.push(new Entity(content.firstElementChild, entityConfig, this))
//     }

//     this.#replace ? this.#root.replaceWith(content) : this.#root.replaceChildren(content)
//   }

//   #renderChild (content, child, callback) {
//     return callback(child, content.getElementById(child.id))
//   }

//   #renderCollection (content, collection, callback) {
//     for (let item of collection) {
//       this.#renderChild(content, item, callback)
//     }
//   }

//   #getOptions (node) {
//     return {
//       retainFormatting: this.#options.retainFormatting || !!node.closest('pre')
//     }
//   }

//   #bindAttributes (nodes, attributes) {
//     if (nodes.length === 0) {
//       throw new Error(`Cannot bind attributes to non-element nodes`)
//     }

//     if (nodes.length > 1) {
//       throw new Error(`Cannot bind attributes to more than one node`)
//     }

//     const node = nodes[0]

//     for (let attribute in attributes) {
//       this.#setAttribute(node, attribute, attributes[attribute])
//     }
//   }

//   #bindListeners (nodes, listeners) {
//     if (nodes.length === 0) {
//       throw new Error(`Cannot bind event listeners to non-element nodes`)
//     }

//     if (nodes.length > 1) {
//       throw new Error(`Cannot bind event listeners to more than one node`)
//     }

//     for (let evt in listeners) {
//       listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(this, nodes[0], evt, handler, cfg))
//     }
//   }

//   #setAttribute (node, name, value) {
//     if (Array.isArray(value)) {
//       const list = processList(value)
//       return node.setAttribute(name, list.join(' '))
//     }

//     if (value instanceof TrackingInterpolation) {
//       return console.log('HANDLE ATTRIBUTE TRACKER')
//     }

//     let type = typeOf(value)

//     switch (type) {
//       case 'string':
//       case 'number': return node.setAttribute(name, value)
//       case 'boolean': return value && node.setAttribute(name, '')
//       case 'object': return Object.keys(value).forEach(slug => this.#setAttribute(node, `${name}-${slug}`, value[slug]))
//       default: throw new TypeError(`"${this.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
//     }
//   }
// }