import App from './App.js'
import history from 'history'

let app
let config = {}
let initialized = false
let ready = false
let currentPath = location.pathname

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && initialize()
})

history.listen(({ location }) => {
  const path = location.pathname
  app.render(path, currentPath)
  currentPath = path
})

function createApp (cfg) {
  if (initialized) {
    throw new Error(`App has already been initialized`)
  }

  config = cfg
  config.baseURL = new URL(cfg.baseURL ?? '', location.origin)
  initialized = true
  ready && initialize()
}

function initialize () {
  const nodes = document.querySelectorAll(config.selector ?? 'body')
  
  if (nodes.length > 1) {
    throw new Error(`Invalid root element selector: "${config.selector}" returned multiple nodes.`)
  }

  app = new App(nodes[0], config)
  app.render(currentPath)
}

function navigate (path) {
  history.push(path)
}

export {
  html,
  svg
} from './lib/tags.js'

export {
  createApp,
  navigate
}