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
      return renderApp(app)
    }

    queue.add(app)
  }

  for (const app of queue) {
    renderApp(app)
    queue.delete(app)
  }
}

function renderApp (app) {
  APPS.set(app.id, app)
  app.render()
}

export { html } from './Template'
export { bind } from './Binding'
