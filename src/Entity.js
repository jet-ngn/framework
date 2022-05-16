import { TreeNode } from './Tree'
import EventRegistry from './registries/EventRegistry'
import Bus from './Bus'
import Parser from './Parser'
import Router from './Router'
import DefaultRoutes from './lib/routes'
import { renderTemplate } from './utilities/RenderUtils'
import { getNeededScore } from './utilities/RouteUtils'
import { INTERNAL_ACCESS_KEY, PATH } from './env'

export default function Entity (superclass = TreeNode, is404 = false) {
  return class Entity extends superclass {
    #description
    #name
    #rendered = false
    #route
    #router
    #scope
    #version

    constructor (parent, root, { description, name, on, routes, scope, version }, idPrefix = 'entity') {
      super(parent, root, idPrefix)
      
      this.#description = description ?? null
      this.#name = name ?? `${root.tagName.toLowerCase()}::${this.id}${version ? `@${version}` : ''}`
      this.#router = routes ? new Router(this, routes) : null
      this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
      this.#version = version ?? null

      Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
      this.#render(Reflect.get(arguments[2], 'template', this))
    }

    get description () {
      return this.#description
    }

    get name () {
      return this.#name
    }

    get scope () {
      return this.#scope
    }

    get version () {
      return this.#version
    }

    emit (evt, ...args) {
      let key = null

      if (typeof evt === 'symbol') {
        key = evt
        evt = args[0]
        args = args.slice(1)
      }

      if (!!EventRegistry.reservedNames.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
        throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
      }

      Bus.emit(`${this.scope}.${evt}`, ...args)
    }

    find (selector) {
      selector = selector.trim()
      return [...this.root.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`)]//.map(node => new Node(node))
    }

    #render (template) {
      const neededScore = is404 ? 0 : getNeededScore(PATH.remaining)

      const results = {
        template: {
          fragment: null,
          score: 0
        },

        routes: {
          score: 0
        }
      }

      results.template.fragment = template ? this.#renderTemplate(template, results.template) : null

      if (neededScore === 0) {
        return this.root.replaceChildren(results.template.fragment ?? '')
      }

      this.#router?.render(results.routes)

      if ([results.template.score, results.routes.score].every(score => score === 0)) {
        return this.#renderTemplate(Reflect.get(this.#router?.routes?.[404] ?? DefaultRoutes[404], 'template', this))
      }

      if (results.template.score === results.routes.score) {
        throw new Error(`Multiple rendering paths matched route ${PATH.current}. Check your routing configuration.`)
      }

      if (results.routes.score > results.template.score) {
        return
      }

      return this.root.replaceChildren(results.template.fragment ?? '')
    }

    #renderTemplate (template, { score = 0 } = {}) {
      const { fragment, templates, trackers } = Parser.parse(template, this.root.tagName === 'PRE')
      const root = fragment.firstElementChild

      if (!root) {
        return fragment
      }

      const hasMultipleRoots = fragment.children.length > 1
      const { attributes, listeners, properties, config, routes } = template

      if (routes) {
        console.log('HANDLE ROUTER')
        return fragment
      }

      if (config) {
        console.log('HANDLE CONFIG')
        return fragment
      }

      console.log('HANDLE NESTED TRACKERS')
      console.log('HANDLE NESTED TEMPLATES')

      return fragment
    }
  }
}