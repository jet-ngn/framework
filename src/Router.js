import TreeNode from './TreeNode'
import { getSlugs, parseRoutes } from './utilities/RouteUtils'
import { PATH } from './env'

export default class Router extends TreeNode {
  #routes

  constructor (parent, routes) {
    super(parent.root, 'router')
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
          match.props = props
          let remainingSlugs = pathSlugs.slice(routeSlugs.length)
          PATH.remaining = remainingSlugs.length === 0 ? null : `/${remainingSlugs.join('/')}`
        }
      }
      
      result.score = bestScore
      return match
    }, null)
  }
}