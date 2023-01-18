import Route from './Route'
import View from '../rendering/View'
import Session from '../session/Session'

import { getPermittedView } from '../../utilities/permissions'

import NotFound from '../views/404.js'
import Unauthorized from '../views/401.js'
import Forbidden from '../views/403.js'

import { Path } from '../../env'

export default class Router {
  #currentConfig = null
  #currentView = null
  #element
  #parent
  #parentView
  #previousConfig = null
  #previousView = null
  #routes
  #matchedPath = null
  #remainingPath = null
  #notFoundConfig

  constructor ({ parentView, parentRouter, element, routes }) {
    this.#element = element
    this.#parent = parentRouter ?? null
    this.#parentView = parentView
    this.#notFoundConfig = NotFound

    this.#routes = Object.keys(routes)
      .reduce((result, path) => {
        const config = routes[path]

        if (['404', 404].includes(path)) {
          this.#notFoundConfig = config
          return result
        }

        return [...result, new Route(path, config)]
      }, [])
      .sort((a,b) => {
        if (a.slugs.length === b.slugs.length) {
          return a.value > b.value ? -1 : a.value === b.value ? 0 : 1
        }

        return a.slugs.length > b.slugs.length ? -1 : 1
      })
  }

  get currentConfig () {
    return this.#currentConfig
  }

  get element () {
    return this.#element
  }

  get parent () {
    return this.#parent
  }

  get parentView () {
    return this.#parentView
  }

  get path () {
    return {
      matched: this.#matchedPath,
      remaining: this.#remainingPath
    }
  }

  get previousConfig () {
    return this.#previousConfig
  }

  get previousView () {
    return this.#previousView
  }

  get notFoundView () {
    return new View({
      parent: this.#parentView,
      element: this.#element,
      config: this.#notFoundConfig
    })
  }

  getMatchingView (path) {
    this.#matchedPath = null
    this.#remainingPath = path

    const match = this.#matchingRoute
    this.#previousView = this.#currentView
    this.#previousConfig = this.#currentConfig

    if (match?.config !== this.#currentConfig) {
      this.#currentConfig = match?.config ?? this.#notFoundConfig

      this.#currentView = getPermittedView(new View({
        parent: this.#parentView,
        element: this.#element,
        config: this.#currentConfig
      }))
    }

    return this.#currentView
  }

  get #matchingRoute () {
    const slugs = getRouteSlugs(this.#remainingPath)
    let match = this.#routes.find(({ path }) => path === '/') ?? null

    if (slugs.length === 0) {
      this.#matchedPath = '/'
      this.#remainingPath = null
      return match
    }

    for (const route of this.#routes.filter(({ path }) => path !== '/')) {
      const vars = {}

      if (this.#routeMatches(route, slugs, vars)) {
        Path.vars = vars
        match = route
        break
      }
    }

    return match
  }

  #routeMatches (route, slugs, vars) {
    let matched = null,
        remaining = null
  
    const matches = slugs.reduce((score, slug, index) => {
      const candidate = route.slugs[index]
  
      if (candidate?.startsWith(':')) {
        matched = concat(matched, slug)
        vars[candidate.replace(':', '')] = slug
        return score += 1
      }
  
      if (candidate === slug) {
        matched = concat(matched, slug)
        return score += 2
      }
      
      remaining = concat(remaining, slug)
      return score
    }, 0) === route.value

    if (matches) {
      this.#matchedPath = matched
      this.#remainingPath = remaining
    }
  
    return matches
  }
}

export function getRouteSlugs (path) {
  return path?.trim().split('/').filter(Boolean) ?? []
}

export function getScore (slugs) {
  return slugs.reduce((score, slug) => score += slug.startsWith(':') ? 1 : 2, 0)
}

function concat (base, ...slugs) {
  return `${base ?? ''}${slugs.reduce((result, slug) => `${result}/${slug}`, '')}`
}