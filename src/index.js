import Application from './Application'
import history from 'history'
import { PATH } from './env'

let App
let config
let initialized = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && run()
})

history.listen(({ action, location }) => {
  const { pathname } = location
  PATH.current = pathname === '/' ? null : pathname
  PATH.remaining = PATH.current
  App.reconcile(config)
})

export function createApp ({ baseURL, selector }) {
  if (initialized) {
    throw new Error(`Cannot create app as it has already been initialized`)
  }

  config = arguments[0]
  config.selector = selector ?? 'body'
  PATH.base = new URL(baseURL ?? '', location.origin)
  initialized = true

  ready && run()
}

export function navigate (to, payload) {
  PATH.previous = PATH.current
  history.push(...arguments)
}

function run () {
  const nodes = document.querySelectorAll(config.selector)

  if (nodes.length > 1) {
    throw new Error(`Invalid app root element selector: "${config.selector}" returned multiple nodes.`)
  }

  const { pathname } = location
  PATH.current = pathname === '/' ? null : pathname
  PATH.remaining = PATH.current

  App = new Application(nodes[0], config)
  App.run(config)
}

export { bind } from './registries/DataStoreRegistry'
export { createID } from './utilities/IDUtils'
export { html, svg } from './lib/tags'
export { default as Bus } from './Bus'
export { Components } from './env'