import { NANOID } from '@ngnjs/libdata'
import { addHandler, /*applyEventHandlers,*/ getNamespacedEvent } from './utilities/EventUtils.js'
// import { attachDataManager } from './data/DataManager.js'
// import { attachStateManager } from './StateManager.js'
// import { attachReferenceManager } from './ReferenceManager.js'
import DOMEventRegistry from './registries/DOMEventRegistry.js'
import TrackerRegistry from './registries/TrackerRegistry.js'
import Tag from './Tag.js'

class Entity {
  #id = NANOID()
  #name
  #root
  #parent

  constructor (name, root, parent) {
    this.#name = name
    this.#root = root
    this.#parent = parent ?? null
  }

  get id () {
    return this.#id
  }

  get parent () {
    return this.#parent
  }

  get name () {
    return this.#name
  }

  get root () {
    return this.#root
  }

  emit (evt, ...args) {
    NGN.BUS.emit(getNamespacedEvent(this.name, evt), ...args)
  }

  on (evt, cfg, cb) {
    return addHandler(this, ...arguments)
  }

  off (evt, handler) {
    NGN.BUS.off(getNamespacedEvent(this.name, evt), handler)
  }
}

export function makeEntity (element, cfg, parent) {
  const entity = new Entity(cfg.name, element, parent)
  const tag = Reflect.get(cfg, 'template', entity)

  return {
    entity,

    async mount () {
      // attachReferenceManager(entity, cfg.references ?? {})
      // attachDataManager(entity, cfg.data ?? {})
      // attachStateManager(entity, cfg.states ?? null),
      // applyEventHandlers(entity, cfg.on ?? {})

      if (tag) {
        const retainFormatting = entity.root.tagName === 'PRE'
        const trackers = new TrackerRegistry(entity, { retainFormatting })

        if (!(tag instanceof Tag)) {
          throw new TypeError(`"${entity.name}" render function must return a tagged template literal`)
        }

        const fragment = await tag.render({ entity, retainFormatting, trackers })
        entity.root.replaceChildren(fragment)
      }

      await cfg.on?.mount?.call(entity)
    },

    async unmount () {
      console.log('UNMOUNT', tag)
      await cfg.on?.unmount?.call(entity)
    }
  }
}

// , ...Object.keys(cfg).reduce((result, property) => {
//   switch (property) {
//     case 'on':
//     case 'name':
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