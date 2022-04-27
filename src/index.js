// import './lib/``exceptions.js'
import EntityRegistry from './EntityRegistry.js'
import Application from './Application.js'
import { parseSearchParams } from './utilities/RouteUtils.js'
import history from 'history'
import { INTERNAL_ACCESS_KEY } from './globals.js'

let App
let ready = false
let started = false
let appConfig
let current = {}
let args = []

// TODO: Possibly make current a trackable

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  started && initialize()
})

history.listen(({ action, location }) => {
  console.log(action);
  const { pathname } = location
  let aborted = false

  App.emit(INTERNAL_ACCESS_KEY, 'route.change', {
    from: current.path,
    to: pathname,
    abort: () => aborted = true
  }, ...args)

  if (!aborted) {
    current.unmount()
    mountEntity(App.routes.match(pathname))
    current.path = pathname
  }

  args = []
})

function initialize () {
  App = new Application(appConfig)
  current.path = location.pathname
  mountEntity(App.routes.match(current.path))
}

function mountEntity (config, ...args) {
  current = {
    ...current,
    
    ...EntityRegistry.register({
      parent: App,
      root: App.root,
      config
    })
  }

  current.mount(parseSearchParams(location.search), ...args)
}

export function createApp ({ baseURL, routes }) {
  if (started) {
    throw new Error(`App has already started`)
  }

  appConfig = {
    ...arguments[0],
    baseURL: new URL(baseURL ?? '', location.origin),
    routes: routes ?? {}
  }

  started = true
  ready && initialize()
}

export function navigate (to, ...rest) {
  console.log('NAV')
  args = rest
  history.push(to)
}

export { html, svg } from './lib/tags.js'
export { track, getChanges } from './TrackableRegistry.js'
export { Trackable } from './Trackable.js'