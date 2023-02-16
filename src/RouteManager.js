import WorkerSubscriber from './WorkerSubscriber'
import { ROUTE_WORKER } from './env'

function processRoutes (cfg) {
  const mappings = {
    local: {},
    worker: {}
  }

  for (const path of Object.keys(cfg)) {
    const id = crypto.randomUUID(),
          data = cfg[path],
          { routes } = data

    let entry = {
      local: { path, view: data },
      worker: { route: id }
    }

    if (routes) {
      const { local, worker } = processRoutes(routes)
      entry.local.children = local
      entry.worker.children = worker
    }

    mappings.local[id] = entry.local
    mappings.worker[path] = entry.worker
  }

  return mappings
}

export default class RouteManager extends WorkerSubscriber {
  #baseURL
  #routes

  constructor (context, routes, baseURL) {
    const { local, worker } = processRoutes(routes)

    super(ROUTE_WORKER, {
      id: context.id,
      routes: worker,
      baseURL
    }, (action, payload) => {
      console.log('HANDLE', action)

      // switch (action) {
      //   case 'app registered': return this.emit('ready')
      // }
    })

    this.#baseURL = baseURL
    this.#routes = local
  }

  get routes () {
    return this.#routes
  }
}