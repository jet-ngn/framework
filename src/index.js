import App from './App.js'
import history from 'history'

import { BUS as Bus, EventEmitter } from 'NGN'
import { html, svg } from './lib/tags.js'

import { Trackable } from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'

let app
let config = {}
let initialized = false
let ready = false
let currentPath = location.pathname

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && initialize()
})

history.listen(({ location }) => {
  const path = location.pathname
  app.render(path, currentPath)
  currentPath = path
})

export function createApp (cfg) {
  if (initialized) {
    throw new Error(`App has already been initialized`)
  }

  config = cfg
  config.baseURL = new URL(cfg.baseURL ?? '', location.origin)
  initialized = true
  ready && initialize()
}

function initialize () {
  const nodes = document.querySelectorAll(config.selector ?? 'body')
  
  if (nodes.length > 1) {
    throw new Error(`Invalid root element selector: "${config.selector}" returned multiple nodes.`)
  }

  app = new App(nodes[0], config)
  app.render(currentPath)
}

const Components = {}

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

export function navigate (path) {
  history.push(path)
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