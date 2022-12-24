import Application from './Application'
import { PATH, Plugins } from './env'
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

let App
let config
let created = false
let ready = false

document.addEventListener('DOMContentLoaded', async (evt) => {
  ready = true
  created && await run()
})

window.addEventListener('popstate', async (evt) => {
  // TODO: If history has no entries, do default action (this is if you navigate
  // to the jet app, then navigate back from where you came from outside of the app)
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

export { css, html, svg } from './lib/rendering/tags'
export { default as Bus } from './lib/events/Bus'
export { default as Session } from './lib/session/Session'
export { Data, Plugins }