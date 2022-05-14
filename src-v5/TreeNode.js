import Parser from './Parser'
import Route from './Route'
import View from './View'
import DOMEventRegistry from './registries/DOMEventRegistry'
import EventRegistry from './registries/EventRegistry'
import DefaultRoutes from './lib/routes'
import TrackingInterpolation from './TrackingInterpolation'
import AttributeList from './AttributeList'
import { getExistingAttributeValue } from './utilities/AttributeUtils'
import { getSlugs } from './utilities/RouteUtils'
import { html } from './lib/tags'
import { INTERNAL_ACCESS_KEY, APP } from './env'

export default class TreeNode {
  #routes
  #template
  #view
  #path
  #status
  #children = []

  constructor (parent, root, config) {
    this.#view = new View(parent, root, config)
    this.#template = Reflect.get(config, 'template', this.#view) ?? null
    
    this.#routes = Object.keys(config.routes ?? {}).reduce((result, route) => {
      route = route.trim()

      return {
        ...(result ?? {}),
        [route]: new Route(new URL(route, APP.baseURL), config.routes[route])
      }
    }, null)

    Object.keys(config.on ?? {}).forEach(evt => EventRegistry.addHandler(this.#view, evt, config.on[evt]))

    APP.tasks.push(...[{
      name: `View ${this.#view.name ? `name: "${this.#view.name}"` : `scope: ${this.#view.scope}`}: Mount`,
      callback: () => this.#view.emit(INTERNAL_ACCESS_KEY, 'mount')
    }])
  }

  get matchingRoute () {
    if (this.#path === '/') {
      this.#path = null
      return this.#routes['/'] ?? null
    }
  
    const pathSlugs = getSlugs(this.#path)
    let bestScore = 0
  
    return Object.keys(this.#routes ?? {}).reduce((match, route) => {
      const routeSlugs = getSlugs(route)
      const scores = new Array(routeSlugs.length).fill(0)
      const neededScore = routeSlugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
      const props = {}
  
      if (neededScore >= bestScore) {
        pathSlugs.forEach((pathSlug, i) => {
          const routeSlug = routeSlugs[i]
    
          if (scores.length >= i + 1) {
            if (routeSlug?.startsWith(':')) {
              scores[i] = 1
              props[routeSlug.substring(1)] = pathSlug
            } else {
              scores[i] = pathSlug === routeSlug ? 2 : 0
            }
          }
        })
    
        const finalScore = scores.reduce((result, score) => result += score, 0)
        
        if (finalScore === neededScore && finalScore > bestScore) {
          bestScore = finalScore
          match = this.#routes[route]
          let remainingSlugs = pathSlugs.slice(routeSlugs.length)
          this.#path = remainingSlugs.length === 0 ? '' : `/${remainingSlugs.join('/')}`
        }
      }
  
      return match
    }, null)
  }

  render (path, isChild = false) {
    console.log('RENDER VIEW', this.#view.name);
    this.#status = 200
    this.#path = path
    let output

    

    // if (this.#path) {
    //   console.log('HAS PATH', this.#path)

    //   if (this.#routes) {
    //     console.log('HAS ROUTES')
    //     const match = this.matchingRoute

    //     if (match) {
    //       console.log('MATCH FOUND', match)
    //       output = this.#renderChildView(this.#view.root, match.config)
    //     } else {
    //       console.log('NO MATCH FOUND. RENDER 404')
    //       output = this.#renderTemplate(this.#get404Template())
    //     }
    //   } else {
    //     console.log('DOES NOT HAVE ROUTES')



    //     // if (this.#path) {
    //     //   console.log('HAS REMAINING PATH', this.#path)

    //     //   if (isChild) {
    //     //     console.log('IS CHILD. RENDER 404')
    //     //     output = this.#renderTemplate(this.#get404Template())
    //     //   } else {
    //     //     console.log('IS NOT CHILD. RENDER TEMPLATE')
    //     //     output = this.#renderTemplate(this.#path && this.#path !== '/' ? this.#get404Template() : this.#template)
    //     //     // output = this.#path && this.#path !== '/' ? this.#renderTemplate(this.#template, true) : this.#renderTemplate(this.#get404Template())
    //     //   }
    //     // } else {
    //     //   console.log('DOES NOT HAVE REMAINING PATH');
    //     //   output = this.#renderTemplate(this.#template, true)
    //     // }
    //   }
    // } else {
    //   console.log('DOES NOT HAVE PATH')
    //   output = this.#renderTemplate(this.#template, true)
    // }

    // return output

    // if (!this.#path || !this.#routes) {
    //   output = this.#renderTemplate(this.#template, true)
    // }

    // const match = this.matchingRoute

    // if (!match) {
    //   console.log('NO MATCH FOUND. RENDER 404');
    //   output = this.#renderTemplate(this.#get404Template())
    // } 

    // console.log('MATCH', match);
    // return this.#renderChildView(this.#view.root, match.config)
    // return this.#renderTemplate(Reflect.get(match.config, 'template', this.#view))
    // const template = document.createElement('template')
    // return this.#generateOutput(isChild)
  }

  #generateOutput (isChild) {
    if (!this.#path) {
      // console.log('NO PATH. RENDER TEMPLATE')
      return this.#renderTemplate(this.#template, true)
    }

    // console.log('PATH', this.#path)

    if (!this.#routes) {
      // console.log('NO ROUTES. RENDER TEMPLATE')
      return this.#renderTemplate(this.#template, !isChild) // Make this boolean conditional: this.#isRoot
    }

    const match = this.matchingRoute

    if (!match) {
      // console.log('NO MATCH FOUND. RENDER 404');
      return this.#renderTemplate(this.#get404Template()) 
    }

    // const node = new TreeNode(this.#view, this.#view.root, match.config)
    // this.#children.push(node)
    // return node.render(this.#path)
    // return this.#renderTemplate(Reflect.get(match.config, 'template', this.#view))
    // return this.#renderChildView(this.#view.root, match.config)

    // console.log('MATCHED', match)
    // return this.#renderChildView(this.#view.root, match.config)
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

  #get404Template () {
    this.#status = 404
    const config = this.#routes?.[404] ?? DefaultRoutes[404]
    return Reflect.get(config, 'template', this) ?? html``
  }

  #renderChildView (root, config) {
    const node = new TreeNode(this.#view, ...arguments)
    this.#children.push(node)
    return node.render(this.#path, true)
  }

  #renderTemplate (template, allowBlank = false) {
    template = template ?? (allowBlank ? html`` : this.#get404Template())

    const parser = new Parser({
      retainFormatting: this.#status === 200 ? this.#view.root.tagName === 'PRE' : false
    })

    const target = document.createElement('template')
    target.innerHTML = parser.parse(template)

    const { content } = target

    const root = content.firstElementChild
    const hasMultipleRoots = content.children.length > 1
    const { attributes, listeners, properties, viewConfig } = template

    if (!!attributes) {
      this.#bind('attributes', root, hasMultipleRoots, () => {
        for (let attribute in attributes ?? {}) {
          this.#setAttribute(root, attribute, attributes[attribute])
        }
      })
    }

    if (!!properties) {
      this.#bind('properties', root, hasMultipleRoots, () => {
        for (let property in properties ?? {}) {
          this.#setProperty(root, property, properties[property])
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
      console.log(viewConfig);
      return this.#renderChildView(root, viewConfig)

    } else {
      const { templates, trackers } = parser

      // console.log('RENDER TRACKERS')


      Object.keys(templates ?? {}).forEach(id => {
        const placeholder = content.getElementById(id)
        placeholder && placeholder.replaceWith(this.#renderTemplate(templates[id]))
      })
    }
    
    return content
  }

  #setAttribute (node, name, value) {
    if (value instanceof TrackingInterpolation) {
      return console.log('STORE ATTRIBUTE TRACKER')
      // const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#view)
      // return tracker.reconcile()
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

  #setProperty (node, name, value) {
    if (value instanceof TrackingInterpolation) {
      return console.log('STORE PROPERTY TRACKER')
      // const tracker = TrackableRegistry.registerAttributeTracker(node, name, value, this.#view)
      // return tracker.reconcile()
    }

    node[name] = value
  }
}