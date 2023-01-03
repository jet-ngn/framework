import Application from './Application'
import { Path, Plugins } from './env'
import { createId } from './utilities/IDUtils'
import { append, bind, clear, load } from './lib/data/DataRegistry'
import StateFactory from './lib/data/StateFactory'

const Data = {
  append,
  bind,
  clear,
  createId,
  load,
  State: StateFactory
}

class Router {
  static get base () {
    return Path.base
  }

  static get path () {
    const { pathname } = location
    const base = Path.base.pathname
    return base === '/' ? pathname : pathname.replace(base, '')
  }

  static get vars () {
    return { ...(Path.vars ?? {}) }
  }
}

let App
let appConfig
let appCreated = false
let DOMReady = false

document.addEventListener('DOMContentLoaded', async (evt) => {
  DOMReady = true
  appCreated && await run()
})

window.addEventListener('popstate', async (evt) => {
  // TODO: If history has no entries, do default action (this is if you navigate
  // to the jet app, then navigate back from where you came from outside of the app)
  evt.preventDefault()
  await App.update()
})

export async function createApp ({ baseURL, selector }) {
  if (appCreated) {
    throw new Error(`App has already been created`)
  }

  appConfig = arguments[0]
  appConfig.selector = selector ?? 'body'
  Path.base = new URL(baseURL ?? '', location.origin)
  appCreated = true

  DOMReady && await run()
}

export async function navigate (to, { append = false } = {}) {
  const { pathname } = location

  if (to === pathname) {
    throw new Error(`Cannot navigate: "${to}" is already the current location`)
  }

  history.pushState(null, null, `${append ? pathname : ''}${to}`)
  await App.update()
}

async function run () {
  const nodes = document.querySelectorAll(appConfig.selector)
  const error = `Invalid app root element selector: "${appConfig.selector}"`

  if (nodes.length === 0) {
    throw new Error(`${error} returned no node.`)
  }

  if (nodes.length > 1) {
    throw new Error(`${error} returned multiple nodes.`)
  }

  App = new Application(nodes[0], appConfig)
  await App.render()
}

export { css, html, svg } from './lib/rendering/tags'
export { default as Bus } from './lib/events/Bus'
export { default as Session } from './lib/session/Session'
export { Data, Plugins, Router }