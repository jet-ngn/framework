// import './lib/``exceptions.js'
import { INTERNAL } from 'NGN'
import RouterRegistry from './RouterRegistry.js'
import ViewRegistry from './ViewRegistry.js'
import history from 'history'
import { INTERNAL_ACCESS_KEY } from './globals.js'
import { BUS, EventEmitter } from 'NGN'
import { NANOID } from '@ngnjs/libdata'

import { html, svg } from './lib/tags.js'
import { track, getChanges } from './TrackableRegistry.js'
import { Trackable } from './Trackable.js'

let RootView
let RootElementSelector
let RootConfig
let ready = false
let initialized = false
let args = []
const createID = NANOID

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && start()
})

function start () {
  const nodes = document.querySelectorAll(RootElementSelector)

  if (nodes.length > 1) {
    throw new Error(`Invalid root element selector: "${RootElementSelector}" returned multiple nodes.`)
  }

  const { view, mount } = ViewRegistry.register({
    root: nodes[0],
    config: RootConfig
  })

  RootView = view
  mount(location.pathname)
}

function initialize (selector, config) {
  if (initialized) {
    throw new Error(`App has already been initialized`)
  }

  RootConfig = config
  RouterRegistry.baseURL = new URL(config.baseURL ?? '', location.origin)
  RootElementSelector = selector
  initialized = true
  ready && start()
}

const Plugins = {}

function install (...plugins) {
  plugins.forEach(plugin => plugin.install({ createID, html, svg, track, getChanges, Trackable }, Plugins))
}

function navigate (to, ...rest) {
  args = rest
  history.push(to)
}

export {
  BUS as Bus,
  EventEmitter,
  Plugins,
  Trackable,
  createID,
  getChanges,
  html,
  initialize,
  install,
  navigate,
  svg,
  track
}