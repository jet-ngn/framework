import Application from './Application'
import { Path } from './env'

let App
let appConfig
let appCreated = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
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

  ready && run()
}

export function navigate (to, options, callback) {
  const { pathname } = location
  const { append = false } = options ?? {}

  if (to === pathname) {
    throw new Error(`Cannot navigate: "${to}" is already the current location`)
  }

  history.pushState(null, null, `${append ? pathname : ''}${to}`)
  App.update(callback)
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

export { default as Bus } from './events/Bus'
export { default as Session } from './session/Session'
export { default as Router } from './router/Router'
