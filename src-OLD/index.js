import Application from './Application'
import history from 'history'
import { generateTree, mount, unmount } from './utilities/RenderUtils'
import { INTERNAL_ACCESS_KEY, PATH, TASKS, TREE } from './env'
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

history.listen(({ location }) => {
  const { pathname } = location
  pathname !== PATH.current && rerender(pathname)
})

InternalBus.on('session.opened', () => rerender(location.pathname))

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
  history.push(...arguments)
}

function render () {
  TREE.lowestChild = null
  console.log('BEFORE MOUNT ', App.name);
  let abort = false

  App.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
    abort: () => {
      console.log('ABORT MOUNT ', App.name)
      abort = true
    }
  })
  
  let fragment = generateTree(App, config, abort)

  if (PATH.remaining) {
    if (TREE.lowestChild) {
      TREE.lowestChild.root.replaceChildren('404')
    } else {
      fragment = '404'
    }
  }

  TREE.lowestChild = null

  console.log('ABORT: ', abort);

  App.root.replaceChildren(fragment)
  mount(App)
  console.log(App);
  // TASKS.forEach(task => task())
  // TASKS.splice(0, TASKS.length)
}

function rerender (pathname) {
  console.log('RERENDER');
  PATH.previous = PATH.current
  PATH.current = pathname === '/' ? null : pathname
  PATH.remaining = PATH.current

  unmount(App)
  removeAllViewEvents()
  App.children = []

  console.log(App);
  // render(App.root, App.id)
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

  render(App)
}

export { bind } from './registries/DatasetRegistry'
export { createID } from './utilities/IDUtils'
export { html, svg } from './lib/tags'
export { default as Bus } from './Bus'
export { Components } from './env'
export { default as Dataset } from './Dataset'
export { default as Session } from './Session'
