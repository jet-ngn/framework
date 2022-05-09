import App from './App.js'

let config = {}
let initialized = false
let ready = false

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && initialize()
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

  const app = new App(nodes[0], config)
  app.render(location.pathname)
}

export {
  html,
  svg
} from './lib/tags.js'

export {
  createApp
}