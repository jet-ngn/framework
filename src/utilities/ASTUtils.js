import Renderer from '../Renderer'
import View from '../View'
import Route from '../Route'
import DefaultRoutes from '../lib/routes'
import { matchPath } from './RouteUtils'
import { APP } from '../env'

function generateRoutes (routes) {
  return Object.keys(routes ?? {}).reduce((result, route) => {
    if (!result) {
      result = {}
    }

    const config = routes[route]
    route = route.trim()
    result[route] = new Route(new URL(route, APP.base), config)
    return result
  }, null)
}

export function generateASTEntry (parent, node, config) {
  return {
    view: new View(parent, node, config),
    node,
    config,
    children: [],
    routes: generateRoutes(config.routes),
    activeRoute: null
  }
}

function renderTemplate (renderer, template, ast) {
  return template ? renderer.render(template, ast) : null
}

export function generateChildren (ast) {
  const { node, config, routes, view } = ast
  const renderer = new Renderer(view, { retainFormatting: node.tagName === 'PRE' })
  let content = renderTemplate(renderer, Reflect.get(config, 'template', view), ast)
  let child

  function generate404 () {
    child = generateASTEntry(view, node, routes?.[404] ?? DefaultRoutes[404])
    const template = Reflect.get(child.config, 'template', view)
    content = template ? renderTemplate(renderer, template, ast) : content
  }

  if (!!routes && !!APP.remainingPath) {
    const match = matchPath(APP.remainingPath, routes)

    if (match) {
      child = generateASTEntry(view, node, match.config)
      ast.activeRoute = match
      APP.currentRoute = match
      content = generateChildren(child)
    } else {
      generate404()
    }

    if (!!APP.remainingPath && !!APP.remainingPath !== '/') {
      generate404()
    }
  }

  // if (!!APP.remainingPath && APP.remainingPath !== '/') {
  //   generate404()
  // }

  child && ast.children.push(child)
  return content
}