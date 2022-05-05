import Session from './Session.js'
import RouterRegistry from './RouterRegistry.js'
import ViewRegistry from './ViewRegistry.js'
import history from 'history'
import { BUS, EventEmitter } from 'NGN'
import { NANOID } from '@ngnjs/libdata'

import { html, svg } from './lib/tags.js'
import { track, getChanges } from './TrackableRegistry.js'
import { Trackable } from './Trackable.js'

const createID = NANOID
const Bus = BUS

let RootView
let RootElementSelector
let RootConfig
let ready = false
let initialized = false
let args = []

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
const Components = {}

function install ({ components }) {
  const jet = {
    Bus,
    EventEmitter,
    createID,
    html,
    navigate,
    svg,
    track,
    getChanges,
    Trackable
  }

  ;(components ?? []).forEach(({ install }) => install(jet, Components))
}

function navigate (to, ...rest) {
  args = rest
  history.push(to)
}

export {
  Bus,
  Components,
  EventEmitter,
  Session,
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