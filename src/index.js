import history from 'history'
import EventRegistry from './registries/EventRegistry'

import { BUS as Bus, EventEmitter } from 'NGN'
import { html, svg } from './lib/tags.js'

import { Trackable } from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'

import { INTERNAL_ACCESS_KEY, APP } from './env'
import { generateASTEntry, generateChildren } from './utilities/ASTUtils'

let config = {}
let root
let initialized = false
let ready = false

const Components = {}

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && initialize()
})

history.listen(({ location }) => {
  const { pathname } = location
  
  if (APP.currentPath === pathname) {
    return
  }

  APP.ast && unmount(APP.ast)

  APP.previousPath = APP.currentPath
  APP.previousRoute = APP.currentRoute
  APP.currentPath = pathname
  APP.remainingPath = APP.currentPath

  render()
})

export function createApp (cfg) {
  if (initialized) {
    throw new Error(`App has already been initialized`)
  }

  config = cfg
  APP.base = new URL(cfg.baseURL ?? '', location.origin)
  APP.currentPath = location.pathname
  APP.remainingPath = APP.currentPath
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
  
  if (!!activeRoute) {
    view.emit(INTERNAL_ACCESS_KEY, 'route.change', {
      from: APP.previousRoute,
      to: APP.currentRoute
    })
  }

  view.emit(INTERNAL_ACCESS_KEY, 'mount')
  children.forEach(mount)
}

function unmount ({ view, children }) {
  children.forEach(unmount)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  EventRegistry.removeByView(view)
}

export function navigate (path) {
  history.push(path)
}

function render () {
  APP.ast = generateASTEntry(null, root, config)
  root.replaceChildren(generateChildren(APP.ast))

  mount(APP.ast)
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