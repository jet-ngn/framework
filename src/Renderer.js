import Parser from './Parser'
import Entity from './Entity'
import Router from './Router'
import DefaultRoutes from './lib/routes'
import DOMEventRegistry from './registries/DOMEventRegistry'
import { generateTreeNode } from './utilities/TreeUtils'
import { PATH } from './env'

function getExistingAttributeValue (node, name) {
  const value = node.getAttribute(name)
  return value ? value.trim().split(' ').map(item => item.trim()) : []
}

export function renderEntity ({ parent, root, config, children, routes, route, retainFormatting }) {
  let template = Reflect.get(config, 'template', parent)
  const child = generateTreeNode('entity', new Entity(parent, root, config), route)
  const renderer = new Renderer(child.target, shouldRetainFormatting(root.tagName === 'PRE', root)) 
  
  children.push(child)
  return renderer.render(template, child, routes)
}

export function shouldRetainFormatting (retainFormatting, node) {
  return retainFormatting || !!node.closest('pre')
}

export default class Renderer {
  #entity
  #parser

  constructor (entity, { retainFormatting }) {
    this.#entity = entity
    this.#parser = new Parser({ retainFormatting })
  }

  render (template, treenode) {
    if (Array.isArray(template)) {
      return console.log('Render Array of Templates')
    }

    switch (template.type) {
      case 'html': return this.#renderHTML(...arguments)
      case 'svg': return this.#renderSVG(...arguments)
      default: throw new TypeError(`Invalid template type "${template.type}"`)
    }
  }

  #validateBinding (item, node, hasMultipleRoots, cb) {
    if (!node) {
      throw new Error(`Cannot bind ${item} to non-element nodes`)
    }

    if (hasMultipleRoots) {
      throw new Error(`Cannot bind ${item} to more than one node`)
    }

    cb()
  }

  #bind (type, collection, root, hasMultipleRoots, cb) {
    this.#validateBinding(type, root, hasMultipleRoots, () => {
      for (let item in collection ?? {}) {
        cb(root, item, collection[item])
      }
    })
  }

  #bindListeners (listeners, root, hasMultipleRoots) {
    this.#validateBinding('listeners', root, hasMultipleRoots, () => {
      for (let evt in listeners ?? {}) {
        listeners[evt].forEach(({ handler, cfg }) => DOMEventRegistry.add(this.#entity, root, evt, handler, cfg))
      }
    })
  }

  #renderHTML (template, treenode, parentRoutes) {
    let content = this.#parser.parse(template)
    const root = content.firstElementChild
    const hasMultipleRoots = content.children.length > 1
    let { attributes, listeners, properties, config, routes } = template
    const args = [root, hasMultipleRoots]

    !!attributes && this.#bind('attributes', attributes, ...args, this.#setAttribute)
    !!properties && this.#bind('properties', properties, ...args, this.#setProperty)
    !!listeners && this.#bindListeners(listeners, ...args)

    if (routes) {
      const router = new Router(this.#entity, root, routes)
      const childTreenode = generateTreeNode('router', router)
      treenode.children.push(childTreenode)
      root.replaceChildren(router.render(childTreenode.children))
      return content
    }
    
    if (config) {
      root.replaceChildren(renderEntity({
        parent: this.#entity,
        root,
        config,
        children: treenode.children,
        routes,
        route: null
      }))

      return content
    }

    const { templates, trackers } = this.#parser

    // console.log('HANDLE NESTED TRACKERS')


    Object.keys(templates ?? {}).forEach(id => {
      const renderer = new Renderer(this.#entity, shouldRetainFormatting(this.#parser.retainFormatting, root))
      const placeholder = content.getElementById(id)
      placeholder && placeholder.replaceWith(renderer.render(templates[id], treenode, parentRoutes))
    })

    if (PATH.remaining) {
      config = parentRoutes?.[404] ?? DefaultRoutes[404]
      content = this.#parser.parse(Reflect.get(config, 'template', this.#entity))
      treenode.children.push(generateTreeNode('entity', new Entity(this.#entity, this.#entity.root, config)))
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
    // if (value instanceof TrackingInterpolation) {
    //   return console.log('HANDLE ATTRIBUTE TRACKER')
    //   // const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#view)
    //   // return tracker.reconcile()
    // }

    const existing = getExistingAttributeValue(node, name)

    if (Array.isArray(value)) {
      const list = new AttributeList(node, name, value.concat(...(existing ?? [])), this.#entity)
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

      default: throw new TypeError(`"${this.#entity.name}" rendering error: Invalid attribute value type "${typeof value}"`)
    }
  }

  #setProperty (node, name, value) {
    // if (value instanceof TrackingInterpolation) {
    //   return console.log('STORE PROPERTY TRACKER')
    //   // const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#view)
    //   // return tracker.reconcile()
    // }

    node[name] = value
  }
}