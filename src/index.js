import Application from './Application'
import history from 'history'
import Bus from './Bus'
import { PATH } from './env'

let App
let initialized = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && run()
})

history.listen(({ action, location }) => {
  PATH.current = location.pathname
  PATH.remaining = PATH.current
  App.reconcile()
})

export function createApp ({ baseURL, selector }) {
  if (initialized) {
    throw new Error(`Cannot create app as it has already been initialized`)
  }

  App = arguments[0]
  App.selector = selector ?? 'body'
  PATH.base = new URL(baseURL ?? '', location.origin)
  initialized = true

  ready && run()
}

export function navigate (to, payload) {
  PATH.previous = PATH.current
  history.push(...arguments)
}

function run () {
  const nodes = document.querySelectorAll(App.selector)

  if (nodes.length > 1) {
    throw new Error(`Invalid app root element selector: "${App.selector}" returned multiple nodes.`)
  }

  const { pathname } = location
  PATH.current = pathname === '/' ? null : pathname
  PATH.remaining = PATH.current

  App = new Application(nodes[0], App)
  console.log(App)
}

export { html, svg } from './lib/tags'

export {
  Bus
}