import { compose } from './utilities.js'
import { attachEventManager, applyEventHandlers } from './EventManager.js'
// import {makeReferenceManager} from './ReferenceManager.js'

// ALL entities should have EventManager, StateManager.
// Optional: References, Data, Methods, Plugins 
// Root will not be managed by ReferenceManager

const attachReferenceManager = obj => {
  return obj
}

export const makeEntity = cfg => {
  class Entity {
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

  let tasks = []

  compose(Entity, ...Object.keys(cfg).reduce((result, property) => {
    switch (property) {
      case 'on': 
        result.push(attachEventManager)
        tasks.push((entity) => applyEventHandlers(entity, cfg.on))
        break

      case 'references': result.push(attachReferenceManager)
        break

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

// export const makeEntity = ({ name, selector, on, references }) => {
//   if (!name) {
//     throw new Error(`Entity configuration error: "name" attribute is required`)
//   }

//   return Object.freeze({
//     id: Symbol(),
//     name,
//     ...makeEventManager(this, on)
//   })

//   // let self = {
//   //   id: Symbol(),
//   //   name
//   // }

//   // // TODO: Handle cases where root element is passed in
//   // const root = selector ? document.querySelector(selector) : null

//   // self = { ...self, ...ReferenceManager(self, root, references), }

//   // return Object.freeze({
//   //   ...properties,
    
//   //   ...EventManager(properties, on)
//   // })
// }