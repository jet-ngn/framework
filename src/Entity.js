import { NANOID } from '@ngnjs/libdata'
import { forEachKey } from './utilities/IteratorUtils.js'
import { addHandler, getNamespacedEvent } from './utilities/EventUtils.js'
// import { attachDataManager } from './data/DataManager.js'
// import { attachStateManager } from './StateManager.js'
// import { attachReferenceManager } from './ReferenceManager.js'
import TrackerRegistry from './registries/TrackerRegistry.js'
import Tag from './Tag.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'

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

  // emit (evt, ...args) {
  //   NGN.BUS.emit(getNamespacedEvent(this.name, evt), ...args)
  // }

  // on (evt, cb, cfg) {
  //   return addHandler(this, ...arguments)
  // }

  // off (evt, handler) {
  //   NGN.BUS.off(getNamespacedEvent(this.name, evt), handler)
  // }
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
      applyEventHandlers(entity, cfg.on ?? {})

      if (tag) {
        const retainFormatting = entity.root.tagName === 'PRE'
        const trackerRegistry = new TrackerRegistry(entity, { retainFormatting })

        if (!(tag instanceof Tag)) {
          throw new TypeError(`"${entity.name}" render function must return a tagged template literal`)
        }

        const fragment = await tag.render({ entity, retainFormatting, trackerRegistry })
        entity.root.replaceChildren(fragment)
      }

      await cfg.on?.mount?.call(entity)
    },

    async unmount () {
      BrowserEventRegistry.removeByEntity(entity)
      await cfg.on?.unmount?.call(entity)
    }
  }
}

function applyEventHandlers (entity, cfg) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Invalid entity "on" configuration. Expected "object", received "${typeof cfg}"`)
  }

  forEachKey(cfg, (evt, handler) => {
    if (['mount', 'unmount'].some(eventName => eventName === evt)) {
      return
    }

    addHandler(target, evt, handler)
  })
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