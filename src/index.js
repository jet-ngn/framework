import { DATA, ROUTER, VIEWS } from './env'
import { getPathSlugs } from './utility/routing'

let CONFIG
const requisiteEvents = new Set(['APP_START', 'DATA_INIT', 'DOCUMENT_READY', 'ROUTER_INIT'])

DATA.addEventListener('message', ({ data }) => {
  switch (data.action) {
    case 'init': return init('DATA_INIT')
    default: console.log('HANDLE DATA DEFAULT MESSAGE')
  }
})

ROUTER.addEventListener('message', ({ data }) => {
  switch (data.action) {
    case 'init': return init('ROUTER_INIT')
    default: console.log('HANDLE ROUTER DEFAULT MESSAGE')
  }
})

document.addEventListener('DOMContentLoaded', () => init('DOCUMENT_READY'))

addEventListener('popstate', console.log)

export function start (cfg) {
  CONFIG = cfg

  DATA.postMessage({
    action: 'init',
    payload: cfg.data ?? {}
  })

  ROUTER.postMessage({
    action: 'init',
    payload: [...processRoutes([crypto.randomUUID()], cfg.routes, [], new Map)]
  })

  init('APP_START')
}

function init (event) {
  requisiteEvents.delete(event)

  if (requisiteEvents.size > 0) {
    return
  }

  console.log('INIT APP', CONFIG)
}

function processRoutes (lineage, routes, slugs, mappings) {
  for (const slug of Object.keys(routes)) {
    processRoute(lineage, [...slugs, ...getPathSlugs(slug)], routes[slug], mappings)
  }

  return mappings
}

function processRoute (lineage, slugs, cfg, mappings) {
  const hasKids = Array.isArray(cfg),
        id = crypto.randomUUID(),
        properties = { cfg }

  if (hasKids) {
    properties.cfg = cfg[0]
    properties.children = cfg[1]
  }

  VIEWS.set(id, {
    cfg: properties.cfg,
    route: slugs
  })

  slugs.length > 0 && (lineage = [...lineage, id])
  mappings.set(slugs, lineage)
  hasKids && processRoutes(lineage, properties.children, slugs, mappings)
}