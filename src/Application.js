import View from './View'
import RouteManager from './lib/routing/RouteManager'
import Route from './lib/routing/Route'
import { parse } from './lib/rendering/Parser'
import NotFound from './lib/templates/404'
import { PATH, INTERNAL_ACCESS_KEY } from './env'
import { removeAllViewEvents } from '../src-OLD/registries/EventRegistry'

export default class Application {
  #rootNode
  #config
  #tree

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  get baseURL () {
    return PATH.base.pathname
  }

  render () {
    this.#tree = generateTree(null, this.#rootNode, this.#config)
    // TODO: Inject 404 at bottom of tree if PATH.remaining still has slugs
    renderTree(this.#tree)
  }

  unmount () {
    unmount(this.#tree)
    removeAllViewEvents()
  }
}

function unmount ({ view, children }) {
  children && children.forEach(unmount)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  // removeDOMEventsByView(view)
  // removeEventsByView(view)
  // removeBindingsByView(view)
}

function generateTree (parent, node, config) {
  const { routes, render } = config

  const router = new RouteManager(routes)
  let { route, vars } = router.matchingRoute

  if (route) {
    return {
      view: new View(parent, node, config, new Route({ url: route.url, vars })),
      matchedRoute: generateTree(parent, node, route.config)
    }
  }

  const view = new View(parent, node, config)
  const template = render ? render.call(view) : null

  return {
    view,
    ...(template ? renderTemplate(parse(template, node.tagName === 'PRE')) : {})
  }
}

function renderTree ({ view, matchedRoute }) {
  let abort = false

  view.emit(INTERNAL_ACCESS_KEY, 'willMount', {
    abort: () => {
      abort = true

      view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
        retry: () => abort = false
      })
    }
  })

  if (abort) {
    return
  }

  if (matchedRoute) {
    return renderTree(matchedRoute)
  }
  
  renderView(arguments[0])
}

function renderTemplate ({ fragment }) {
  return {
    fragment,
    children: []
  }
}

function renderView ({ view, fragment }) {
  view.rootNode.replaceChildren(fragment)
  view.emit(INTERNAL_ACCESS_KEY, 'mount')
}