import { compose } from './utilities.js'
import { attachEventManager, applyEventHandlers } from './EventManager.js'
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

  constructor ({ name, selector, on, references }) {
    if (!name) {
      throw new Error(`Entity configuration error: "name" attribute is required`)
    }

    this.#name = name
  }

  get name () {
    return this.#name
  }
}

// const root = selector ? document.querySelector(selector) : null

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

  const entity = new Entity(cfg)

  tasks.forEach(task => task(entity))

  return entity
}