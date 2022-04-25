import './lib/exceptions.js'
import EntityRegistry from './EntityRegistry.js'
import DefaultRoutes from './lib/routes.js'
import Application from './Application.js'
import { parseSearchParams } from './utilities/RouteUtils.js'

let App
let ready = false
let started = false
let appConfig

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  started && initialize()
})

window.addEventListener('popstate', console.log)

function initialize () {
  App = new Application(appConfig)
  const { location } = window

  let { mount } = EntityRegistry.register({
    parent: App,
    root: App.root,
    config: App.routes.match(location.pathname) ?? App.routes.get(404) ?? DefaultRoutes[404]
  })

  mount(parseSearchParams(location.search))
}

export function start (config) {
  if (started) {
    throw new Error(`App has already started`)
  }

  appConfig = {
    ...config,
    baseURL: new URL(config.baseURL ?? '', window.location.origin),
    routes: config.routes ?? {}
  }

  started = true
  ready && initialize()
}

export { html, svg } from './lib/tags.js'