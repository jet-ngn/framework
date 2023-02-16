import { APPS } from './env'
import App from './App'

let ready = false, started = false, queue = new Set

document.addEventListener('DOMContentLoaded', () => {
  ready = true
  started && init()
})

export function start (cfg) {
  const app = new App({ baseURL: location.pathname, ...cfg })
  started = true

  if (!ready) {
    return queue.add(app)
  }

  init(app)
}

function init (app) {
  if (app) {
    if (queue.size > 0) {
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
