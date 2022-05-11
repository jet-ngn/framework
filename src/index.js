import history from 'history'
import EventRegistry from './registries/EventRegistry'

import { BUS as Bus, EventEmitter } from 'NGN'
import { html, svg } from './lib/tags.js'

import { Trackable } from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'

import { INTERNAL_ACCESS_KEY, PATH } from './globals'
import { generateASTEntry, generateChildren } from './utilities/ASTUtils'

let config = {}
let root
let initialized = false
let ready = false
let ast

const Components = {}

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && initialize()
})

// function fireRouteChangeEvents ({ view, activeRoute, children }, evt) {
//   if (!!activeRoute && PATH.activeRoutes.includes(activeRoute)) {
//     console.log(PATH)
//     console.log(activeRoute)
//     console.log('--------------');
//     // view.emit(INTERNAL_ACCESS_KEY, `route.${evt}`, {
//     //   from: PATH.previous,
//     //   to: PATH.current
//     // })
//   }
//   // if (!!routes) {
//   //   const route = routes[PATH.current]

    
//   // }

//   children.forEach(child => fireRouteChangeEvents(child, evt))
// }

history.listen(({ location }) => {
  const { pathname } = location
  
  if (PATH.current === pathname) {
    return
  }

  PATH.previous = PATH.current
  PATH.previousRoute = PATH.currentRoute
  PATH.current = pathname
  PATH.remaining = PATH.current

  // fireRouteChangeEvents(ast, 'beforechange')
  render()
  // fireRouteChangeEvents(ast, 'afterchange')
})

export function createApp (cfg) {
  if (initialized) {
    throw new Error(`App has already been initialized`)
  }

  config = cfg
  PATH.base = new URL(cfg.baseURL ?? '', location.origin)
  PATH.current = location.pathname
  PATH.remaining = PATH.current
  initialized = true

  ready && initialize()
}

function initialize () {
  const nodes = document.querySelectorAll(config.selector ?? 'body')
  
  if (nodes.length > 1) {
    throw new Error(`Invalid root element selector: "${config.selector}" returned multiple nodes.`)
  }

  root = nodes[0]
  render()
}

export function install ({ components }) {
  const jet = {
    Bus,
    EventEmitter,
    html,
    navigate,
    svg,
    track,
    // getChanges,
    Trackable
  }

  ;(components ?? []).forEach(({ install }) => install(jet, Components))
}

function mount ({ view, children, config, activeRoute }) {
  Object.keys(config.on ?? {}).forEach(evt => EventRegistry.addHandler(view, evt, config.on[evt]))
  
  if (!!activeRoute && PATH.activeRoutes.includes(activeRoute)) {
    view.emit(INTERNAL_ACCESS_KEY, 'route.change', {
      from: PATH.previousRoute,
      to: PATH.currentRoute
    })
  }

  view.emit(INTERNAL_ACCESS_KEY, 'mount')
  children.forEach(mount)
}

function unmount ({ view, children }) {
  children.forEach(unmount)
  EventRegistry.removeByView(view)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
}

export function navigate (path) {
  history.push(path)
}

function render () {
  if (!!ast) {
    unmount(ast)
  }

  // console.log(PATH);

  PATH.activeRoutes = []

  ast = generateASTEntry(null, root, config)
  root.replaceChildren(generateChildren(ast))

  mount(ast)
}

export function track (target, property, transform) {
  return new TrackingInterpolation(...arguments)
}

export {
  Bus,
  Components,
  EventEmitter,
  Trackable,
  html,
  svg
}

export { default as Session } from './Session.js'