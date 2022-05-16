import { TreeNode } from './Tree'
import DefaultRoutes from './lib/routes'
import { renderEntity } from './Renderer'
import { getSlugs, parseRoutes } from './utilities/RouteUtils'
import { PATH } from './env'
import Entity from './Entity'

export default class Router extends TreeNode {
  #routes

  constructor (parent, routes) {
    super(parent, parent.root, 'router')
    this.#routes = parseRoutes(routes ?? {})
  }

  get routes () {
    return this.#routes
  }

  getMatchingRoute (result) {
    if (!PATH.remaining) {
      return null
    }

    const pathSlugs = getSlugs(PATH.remaining)
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
          PATH.remaining = remainingSlugs.length === 0 ? null : `/${remainingSlugs.join('/')}`
        }
      }
      
      result.score = bestScore
      return match
    }, null)
  }

  render (result) {
    const match = this.getMatchingRoute(result)

    if (!match) {
      return this.parent.children.push(new (Entity(undefined, true))(this.parent, this.root, this.#routes?.[404] ?? DefaultRoutes[404]))
    }

    this.parent.children.push(new (Entity())(this.parent, this.root, match?.config))
  }
}