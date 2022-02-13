import { compose } from './utilities.js'
import { attachEventManager, applyEventHandlers } from './EventManager.js'
import ElementNode from './ElementNode.js'
// import {makeReferenceManager} from './ReferenceManager.js'

// ALL entities should have EventManager, StateManager.
// Optional: References, Data, Methods, Plugins 
// Root will not be managed by ReferenceManager

const attachReferenceManager = obj => {
  return obj
}

class Base {
  #name
  #root

  constructor (name, selector) {
    if (!name) {
      throw new Error(`Entity configuration error: "name" attribute is required`)
    }

    this.#name = name

    // TODO: Handle cases where selector starts with '>'
    let nodelist = selector ? document.querySelectorAll(selector) : []

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

export const makeEntity = cfg => {
  class Entity extends Base {}

  let tasks = [
    entity => applyEventHandlers(entity, cfg.on)
  ]

  compose(Entity, attachEventManager, ...Object.keys(cfg).reduce((result, property) => {
    switch (property) {
      case 'references': result.push(attachReferenceManager)
        break

      case 'on':
      case 'name':
      case 'selector':
        break
    
      default: throw new Error(`Invalid Entity configuration property "${property}"`)
    }

    return result
  }, []))
  
  const entity = new Entity(cfg.name, cfg.selector)
  tasks.forEach(task => task(entity))
  
  return entity
}