import { PATH } from './env'
import Application from './Application'

let App
let initialized = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && run()
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

function run () {
  const nodes = document.querySelectorAll(App.selector)

  if (nodes.length > 1) {
    throw new Error(`Invalid app root element selector: "${App.selector}" returned multiple nodes.`)
  }

  PATH.current = location.pathname
  PATH.remaining = PATH.current

  App = new Application(nodes[0], App)
  App.render()

  console.log(App);
}

export { html, svg } from './lib/tags'