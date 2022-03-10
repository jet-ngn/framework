import { compose } from './utilities/CompositionUtils.js'
import { attachEventManager, applyEventHandlers } from './events/EventManager.js'
import { attachDataManager } from './data/DataManager.js'
import { attachStateManager } from './StateManager.js'
import { attachReferenceManager } from './ReferenceManager.js'
import { attachTrackerManager, TrackerRegistry } from './renderer/trackers/TrackerManager.js'
import Node from './Node.js'
import { Tag } from './renderer/Tags.js'
import { parseTag, getDOMFragment } from './renderer/Renderer.js'

function getRootNode (entity, selector) {
  if (!selector) {
    return null
  }

  let nodelist = document.querySelectorAll(selector)

  if (nodelist.length === 0) {
    throw new Error(`"${entity}" selector query did not return any elements.`)
  }

  if (nodelist.length > 1) {
    console.info(nodelist)
    throw new Error(`"${entity}" selector refers to more than one element. Please use a more specific selector.`)
  }

  const node = nodelist[0]
  return node ? new Node(node) : null
}

export function makeEntity ({ name, selector, on, states, data, references, initialize, render }, element, manager) {
  class Entity extends EntityBase {}
  compose(Entity, attachEventManager, attachTrackerManager)

  const entity = new Entity(
    name, 
    new Node(element ?? getRootNode(name, selector)),
    render
  )

  return {
    entity,

    async initialize () {
      attachReferenceManager(entity, references ?? {})
      attachDataManager(entity, data ?? {})
      attachStateManager(entity, states ?? null),
      applyEventHandlers(entity, on ?? {})

      if (render) {
        const tag = await render.call(entity, ...arguments)

        if (!(tag instanceof Tag) && typeof tag !== 'string') {
          throw new TypeError(`"${entity.name}" render function must return a tagged template literal or a plain string`)
        }

        const trackers = new TrackerRegistry(entity)
        const { root } = entity
        
        const string = parseTag(tag, {
          retainFormatting: root.tagName === 'PRE',
          trackers
        })

        root.replaceChildren(getDOMFragment(tag.type, string, { trackers }))
      }

      initialize && await initialize.call(entity) // TODO: Maybe pass parent, state, etc data into this function
    }
  }
}

class EntityBase {
  #name
  #root

  constructor (name, root) {
    if (!name) {
      throw new Error(`Configuration error: "name" attribute is required`)
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
  
//     default: throw new Error(`Invalid configuration property "${property}"`)
//   }

//   return result
// }, [])