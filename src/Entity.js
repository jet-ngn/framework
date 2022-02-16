import { compose } from './utilities.js'
import { attachEventManager, applyEventHandlers } from './EventManager.js'
import { attachDataManager } from './DataManager.js'
// import { attachReferenceManager } from './ReferenceManager.js'
import { initializeRouteManager } from './RouteManager.js'
import { attachStateManager } from './StateManager.js'
import ElementNode from './ElementNode.js'

function getRootNode (entity, selector) {
  if (!selector) {
    return null
  }

  let nodelist = document.querySelectorAll(selector)

  if (nodelist.length === 0) {
    throw new Error(`Entity "${entity}" selector query did not return any elements.`)
  }

  if (nodelist.length > 1) {
    console.info(nodelist)
    throw new Error(`Entity "${entity}" selector refers to more than one element. Please use a more specific selector.`)
  }

  const node = nodelist[0]
  return node ? new ElementNode(node) : null
}

export function makeEntity ({ name, selector, on, states, data, initialize, render }, element, manager) {
  class Entity extends EntityBase {}
  compose(Entity, attachEventManager)

  const entity = new Entity(name, new ElementNode(element ?? getRootNode(name, selector)))

  return {
    entity,

    initialize () {
      render && render.call(entity)
      
      attachDataManager(entity, data ?? {})
      attachStateManager(entity, states ?? null),
      applyEventHandlers(entity, on ?? {})

      initialize && initialize.call(entity) // TODO: Maybe pass parent, state, etc data into this function
    }
  }
}

class EntityBase {
  #name
  #root

  constructor (name, root) {
    if (!name) {
      throw new Error(`Entity configuration error: "name" attribute is required`)
    }

    this.#name = name
    this.#root = root
  }

  get name () {
    return this.#name
  }

  get root () {
    return this.#root
  }
}

// , ...Object.keys(cfg).reduce((result, property) => {
//   switch (property) {
//     case 'on':
//     case 'name':
//     case 'selector': 
//     case 'states': 
//     case 'data': 
//     case 'routes': 
//     case 'references': 
//     case 'reactions': 
//     case 'methods': 
//     case 'initialize':
//     case 'render':
//     case 'plugins': break
  
//     default: throw new Error(`Invalid Entity configuration property "${property}"`)
//   }

//   return result
// }, [])