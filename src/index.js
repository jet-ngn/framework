import Application from './Application'
import history from 'history'
import { generateTree, mount, unmount } from './utilities/RenderUtils'
import { PATH, TASKS, TREE } from './env'
import { removeAllViewEvents } from './registries/EventRegistry'
import InternalBus from './InternalBus'

let App
let config
let initialized = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && run()
})

history.listen(rerender)
InternalBus.on('session.opened', rerender)

export function createApp ({ baseURL, commands, selector }) {
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
  history.push(...arguments)
}

function render (root) {
  App = new Application(root, config)
  
  let fragment = generateTree(App, config)

  if (PATH.remaining) {
    if (TREE.lowestChild) {
      TREE.lowestChild.root.replaceChildren('404')
    } else {
      fragment = '404'
    }
  }

  TREE.lowestChild = null

  App.root.replaceChildren(fragment)
  mount(App)
  
  // TASKS.forEach(task => task())
  // TASKS.splice(0, TASKS.length)
}

function rerender () {
  const { pathname } = location

  if (PATH.current === pathname) {
    return
  }

  PATH.previous = PATH.current
  PATH.current = pathname === '/' ? null : pathname
  PATH.remaining = PATH.current

  unmount(App)
  removeAllViewEvents()
  render(App.root)
}

function run () {
  const nodes = document.querySelectorAll(config.selector)

  if (nodes.length > 1) {
    throw new Error(`Invalid app root element selector: "${config.selector}" returned multiple nodes.`)
  }

  const { pathname } = location

  PATH.current = pathname === '/' ? null : pathname
  PATH.remaining = PATH.current

  render(nodes[0])
}

export { bind } from './registries/DatasetRegistry'
export { createID } from './utilities/IDUtils'
export { html, svg } from './lib/tags'
export { default as Bus } from './Bus'
export { Components } from './env'
export { default as Dataset } from './Dataset'
export { default as Session } from './Session'
