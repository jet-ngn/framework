import IdentifiedClass from './IdentifiedClass'
import Entity from './Entity'
import { renderEntity } from './Renderer'
import DefaultRoutes from './lib/routes'
import { getSlugs, parseRoutes } from './utilities/RouteUtils'
import { generateTreeNode } from './utilities/TreeUtils'
import { PATH } from './env'

export default class Router extends IdentifiedClass {
  #parent
  #root
  #routes

  constructor (parent, root, routes) {
    super('router')
    this.#parent = parent
    this.#root = root
    this.#routes = parseRoutes(routes ?? {})
  }

  get routes () {
    return this.#routes
  }

  get matchingRoute () {
    if (!PATH.remaining) {
      return null
    }

    const pathSlugs = getSlugs(PATH.remaining)
    let bestScore = -1
  
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
          PATH.remaining = remainingSlugs.length === 0 ? null : `/${remainingSlugs.join('/')}`
        }
      }
  
      return match
    }, null)
  }

  render (children) {
    const match = this.matchingRoute
    
    return renderEntity({
      parent: this.#parent,
      root: this.#root,
      config: match?.config ?? this.#routes?.[404] ?? DefaultRoutes[404],
      children,
      routes: this.#routes,
      route: match?.path ?? null
    })
  }
}