import View from '../View'
import Parser from '../Parser'
import Route from '../Route'
import Router from '../Router'
import EventRegistry from '../registries/EventRegistry'
import { getNeededScore } from './RouteUtils'
import { INTERNAL_ACCESS_KEY, PATH } from '../env'

export function mount (view) {
  view.children.forEach(mount)
  view.emit(INTERNAL_ACCESS_KEY, 'mount')
}

export function unmount (view) {
  view.children.forEach(unmount)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  EventRegistry.removeByView(view)
}

export function generateChildren (parent, { routes }) {
  const template = Reflect.get(arguments[1], 'template', parent)
  const neededScore = getNeededScore(PATH.remaining)
  const templateResult = template ? parseTemplate(parent, template) : null

  if (neededScore === 0 || templateResult?.score === neededScore) {
    parent.children.push(...templateResult.children)
    return templateResult
  }

  const routerResult = parseRoutes(parent, new Router(parent, routes))
  
  const winner = [templateResult, routerResult].reduce((result, entry) => {
    return entry.score > (result?.score ?? 0) ? entry : result
  }, null)

  if (winner) {
    parent.children.push(...winner.children)
    return winner
  }

  return {
    fragment: '404',
    children: [],
    score: 0
  }
}

function parseRoutes (parent, router) {
  const result = {
    children: [],
    fragment: '404',
    score: 0
  }

  const match = router.getMatchingRoute(result)
  
  if (match) {
    const { config } = match
    const view = new View(parent, parent.root, config, new Route(match))
    const data = generateChildren(view, config)
    view.children.push(...data.children)
    result.children.push(view)
    result.score += data.score
    result.fragment = data.fragment
  }

  return result
}

function parseTemplate (parent, template) {
  const result = {
    children: [],
    fragment: null,
    score: 0
  }

  const { fragment, templates, trackers } = Parser.parse(template, parent.root.tagName === 'PRE')
  const root = fragment.firstElementChild

  result.fragment = fragment
  
  if (!root) {
    return result
  }

  const hasMultipleRoots = fragment.children.length > 1
  const { attributes, listeners, properties, config } = template
  
  if (config) {
    const view = new View(parent, root, config)
    const data = generateChildren(view, config)
    view.children.push(...data.children)
    result.children.push(view)
    result.score += data.score
    root.replaceChildren(data.fragment)
    
  } else {
    // console.log('HANDLE NESTED TRACKERS')

    Object.keys(templates ?? {}).forEach(id => {
      const placeholder = fragment.getElementById(id)
      const parsed = parseTemplate(parent, templates[id])
      result.children.push(...parsed.children)
      result.score += parsed.score
      placeholder.replaceWith(parsed.fragment)
    })
  }

  return result
}