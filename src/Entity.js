import { compose } from './utilities.js'
import { attachEventManager, applyEventHandlers } from './EventManager.js'
import { initializeDataManager } from './DataManager.js'
// import { attachReferenceManager } from './ReferenceManager.js'
import { initializeRouteManager } from './RouteManager.js'
import { initializeStateManager } from './StateManager.js'
import ElementNode from './ElementNode.js'

export function makeEntity (cfg) {
  class Entity extends EntityBase {}

  let tasks = [
    entity => applyEventHandlers(entity, cfg.on ?? {}),
    entity => initializeStateManager(entity, cfg.states ?? null),
    // entity => initializeDataManager(entity, cfg.data ?? {}),
    // entity => initializeRouteManager(entity, cfg.routes ?? {})
  ]

  compose(Entity, attachEventManager, ...Object.keys(cfg).reduce((result, property) => {
    switch (property) {
      case 'on':
      case 'name':
      case 'selector': 
      case 'states': 
      case 'data': 
      case 'routes': 
      case 'references': 
      case 'reactions': 
      case 'methods': 
      case 'plugins': break

      case 'initialize': result.push(obj => obj.prototype.initialize = cfg.initialize); break
      case 'render': result.push(obj => obj.prototype.render = cfg.render); break
    
      default: throw new Error(`Invalid Entity configuration property "${property}"`)
    }

    return result
  }, []))
  
  const entity = new Entity(cfg.name, cfg.selector)
  tasks.forEach(task => task(entity))

  return entity
}

class EntityBase {
  #name
  #root

  constructor (name, selector) {
    if (!name) {
      throw new Error(`Entity configuration error: "name" attribute is required`)
    }

    this.#name = name

    if (!selector) {
      return
    }
    
    Object.defineProperty(this, 'selector', {
      get: () => selector
    })

    let nodelist = document.querySelectorAll(selector)

    if (nodelist.length === 0) {
      throw new Error(`Entity "${name}" selector query did not return any elements.`)
    }

    if (nodelist.length > 1) {
      console.info(nodelist)
      throw new Error(`Entity "${name}" selector refers to more than one element. Please use a more specific selector.`)
    }

    const node = nodelist[0]
    this.#root = node ? new ElementNode(node) : null
  }

  get name () {
    return this.#name
  }

  get root () {
    return this.#root
  }
}