import Application from './Application'
import { Path, Plugins } from './env'
import StateFactory from './lib/data/StateFactory'

let App
let appConfig
let appCreated = false
let DOMReady = false

document.addEventListener('DOMContentLoaded', evt => {
  DOMReady = true
  appCreated && run()
})

window.addEventListener('popstate', evt => {
  // TODO: If history has no entries, do default action (this is if you navigate
  // to the jet app, then navigate back from where you came from outside of the app)
  evt.preventDefault()
  App.update()
})

export function createApp ({ baseURL, selector }) {
  if (appCreated) {
    throw new Error(`App has already been created`)
  }

  appConfig = arguments[0]
  appConfig.selector = selector ?? 'body'
  Path.base = new URL(baseURL ?? '', location.origin)
  appCreated = true

  DOMReady && run()
}

export function navigate (to, { append = false } = {}) {
  const { pathname } = location

  if (to === pathname) {
    throw new Error(`Cannot navigate: "${to}" is already the current location`)
  }

  history.pushState(null, null, `${append ? pathname : ''}${to}`)
  App.update()
}

function run () {
  const nodes = document.querySelectorAll(appConfig.selector)
  const error = `Invalid app root element selector: "${appConfig.selector}"`

  if (nodes.length === 0) {
    throw new Error(`${error} returned no node.`)
  }

  if (nodes.length > 1) {
    throw new Error(`${error} returned multiple nodes.`)
  }

  App = new Application(nodes[0], appConfig)
  App.render()
}

export { css, html, svg } from './lib/rendering/tags'
export { default as Bus } from './lib/events/Bus'
export { default as Session } from './lib/session/Session'
export { default as Router } from './lib/routing/Router'
export { append, bind, bindAll, clear, load } from './lib/data/DataRegistry'
export { createId } from './utilities/IDUtils'
export { Plugins, StateFactory as State }
