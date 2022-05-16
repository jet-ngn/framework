import TreeNode from './TreeNode'
import EventRegistry from './registries/EventRegistry'
import Bus from './Bus'
import Router from './Router'
import DefaultRoutes from './lib/routes'
import { INTERNAL_ACCESS_KEY } from './env'

export default class View extends TreeNode {
  #description
  #name
  #route
  #scope
  #version

  constructor (parent, root, { description, name, on, scope, version }, route, idPrefix = 'view') {
    super(parent, root, idPrefix)
    
    this.#description = description ?? null
    this.#name = name ?? `${root.tagName.toLowerCase()}::${this.id}${version ? `@${version}` : ''}`
    this.#route = route ?? null
    this.#scope = `${parent ? `${parent.scope}.` : ''}${scope ?? this.id}`
    this.#version = version ?? null

    Object.keys(on ?? {}).forEach(evt => EventRegistry.addHandler(this, evt, on[evt]))
  }

  get description () {
    return this.#description
  }

  get name () {
    return this.#name
  }

  get route () {
    return this.#route
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

  // #render404 () {
  //   this.children.push(new View(this, this.root, { ...(this.#router?.routes?.[404] ?? DefaultRoutes[404]), is404: true }))
  // }

  // #renderRoute () {
  //   const match = this.#router.getMatchingRoute(this.#result.route)

  //   return match
  //     ? this.#result.route.children.push(new View(this, this.root, match?.config))
  //     : this.#render404()

  //   // const fallback = this.#routes?.[404] ?? DefaultRoutes[404]

  //   // if (!match) {
  //   //   return this.parent.children.push(new View(this.parent, this.root, { ...fallback, is404: true }))
  //   // }

  //   // this.parent.children.push(new View(this.parent, this.root, match?.config))
  // }

  // #generateChildren (template) {
  //   const neededScore = getNeededScore(PATH.remaining)
  //   const templateResult = template ? this.#analyzeTemplate(template) : null

  //   console.log(templateResult)

  //   if (neededScore === 0) {
  //     this.children = templateResult.children
  //     return templateResult.fragment
  //   }

  //   // this.#router && this.#renderRoute()

  //   // if (Object.values(this.#result).every(({ score }) => score === 0)) {
  //   //   return this.#render404()
  //   // }

  //   // console.log(this.#result);

  //   // console.log('NEEDS: ', neededScore);

  //   // this.#router && this.#renderRoute()

  //   // const winner = Object.keys(this.#result).reduce((result, key) => {
  //   //   const entry = this.#result[key]
  //   //   return !result || entry.score > result.score || (!result.content && !!entry.content) ? entry : result
  //   // }, null)

  //   // return winner.content








  //   // if ([results.template.score, results.routes.score].every(score => score === 0)) {
  //   //   return this.#renderTemplate(Reflect.get(this.#router?.routes?.[404] ?? DefaultRoutes[404], 'template', this))
  //   // }

  //   // if (results.template.score === results.routes.score) {
  //   //   throw new Error(`Multiple rendering paths matched route ${PATH.current}. Check your routing configuration.`)
  //   // }

  //   // if (results.routes.score > results.template.score) {
  //   //   // if (PATH.remaining) {
  //   //   //   this.#attach404(this.children)
  //   //   // }

  //   //   return
  //   // }

  //   // return this.root.replaceChildren(results.template.fragment ?? '')
  // }
}