import Application from './Application'
import { PATH, Plugins } from './env'

let App
let config
let created = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  created && run()
})

window.addEventListener('popstate', async (evt) => {
  evt.preventDefault()
  await updateHistory()
})

export async function createApp ({ baseURL, selector }) {
  if (created) {
    throw new Error(`App has already been created`)
  }

  config = arguments[0]
  config.selector = selector ?? 'body'
  PATH.base = new URL(baseURL ?? '', location.origin)
  created = true

  ready && await run()
}

export async function navigate (to, { append = false, data = null } = {}) {
  if (to === PATH.current) {
    throw new Error(`Cannot navigate: "${to}" is already the current location`)
  }

  history.pushState(data, null, `${append ? PATH.current : ''}${to}`)
  await updateHistory()
}

async function run () {
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
  await App.render()
}

function setPaths () {
  PATH.current = location.pathname
  PATH.remaining = PATH.current.split('/').filter(Boolean)
}

async function updateHistory () {
  PATH.previous = PATH.current
  setPaths()
  await App.rerender()
}

export { bind } from './lib/data/DatasetRegistry'
// export { createComponent } from './lib/Component'
export { createId } from './utilities/IDUtils'
export { css, html, svg } from './lib/rendering/tags'

export { default as Bus } from './lib/events/Bus'
export { default as Dataset } from './lib/data/Dataset'
export { default as Session } from './lib/session/Session'

export { Plugins }