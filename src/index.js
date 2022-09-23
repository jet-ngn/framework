import history from 'history'
import Application from './Application'
import { PATH } from './env'

let App
let config
let created = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  created && run()
})

history.listen(() => rerender())

export function createApp ({ baseURL, selector }) {
  if (created) {
    throw new Error(`App has already been created`)
  }

  config = arguments[0]
  config.selector = selector ?? 'body'
  PATH.base = new URL(baseURL ?? '', location.origin)
  created = true

  ready && run()
}

export function navigate (to, payload) {
  if (to === PATH.current) {
    throw new Error(`Cannot navigate: "${to}" is already the current location`)
  }

  history.push(...arguments)
}

function rerender () {
  PATH.previous = PATH.current
  setPaths()
  App.rerender()
}

function run () {
  const nodes = document.querySelectorAll(config.selector)
  const error = `Invalid app root element selector: "${config.selector}"`

  if (nodes.length === 0) {
    throw new Error(`${error} returned no node.`)
  }

  if (nodes.length > 1) {
    throw new Error(`${error} returned multiple nodes.`)
  }

  delete config.selector
  setPaths()

  App = new Application(nodes[0], config)
  App.render()
}

function setPaths () {
  PATH.current = location.pathname
  PATH.remaining = PATH.current.split('/').filter(Boolean)
}

export { bind } from './lib/data/DatasetRegistry'
export { createComponent } from './lib/Component'
export { createID } from './utilities/IDUtils'
export { css, html, svg } from './lib/rendering/tags'

export { default as Bus } from './lib/events/Bus'
// export { Components } from './env'
export { default as Dataset } from './lib/data/Dataset'
export { default as Session } from './lib/session/Session'