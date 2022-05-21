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

  getMatchingRoute () {
    const match = {
      route: null,
      score: -1,
      vars: null
    }

    if (!PATH.remaining) {
      return match
    }

    const pathSlugs = getSlugs(PATH.remaining)

    Object.keys(this.#routes ?? {}).forEach(route => {
      const routeSlugs = getSlugs(route)
      const scores = new Array(routeSlugs.length).fill(0)
      const neededScore = routeSlugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
      const vars = {}
  
      if (neededScore >= match.score) {
        pathSlugs.forEach((pathSlug, i) => {
          const routeSlug = routeSlugs[i]
    
          if (scores.length >= i + 1) {
            if (routeSlug?.startsWith(':')) {
              scores[i] = 1
              vars[routeSlug.substring(1)] = pathSlug
            } else {
              scores[i] = pathSlug === routeSlug ? 2 : 0
            }
          }
        })
    
        const finalScore = scores.reduce((result, score) => result += score, 0)
        
        if (finalScore === neededScore && finalScore > match.score) {
          match.score = finalScore
          match.route = this.#routes[route]
          match.vars = vars

          let remainingSlugs = pathSlugs.slice(routeSlugs.length)
          PATH.remaining = remainingSlugs.length === 0 ? null : `/${remainingSlugs.join('/')}`
        }
      }
    })

    return match
  }
}