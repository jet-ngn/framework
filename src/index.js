import { APPS } from './env'
import App from './App'

let ready = false, started = false, queue = new Set

document.addEventListener('DOMContentLoaded', () => {
  ready = true
  started && init()
})

export function start ({ selector } = {}) {
  const app = new App({
    baseURL: location.pathname,
    element: selector ? document.querySelector(selector) : document.body,
    ...arguments[0]
  })

  started = true

  if (!ready) {
    return queue.add(app)
  }

  init(app)
}

function init (app) {
  if (app) {
    if (!queue.size) {
      return initApp(app)
    }

    queue.add(app)
  }

  for (const app of queue) {
    initApp(app)
    queue.delete(app)
  }
}

function initApp (app) {
  APPS.set(app.id, app)
  app.render()
}

export { html } from './parser/tags'
