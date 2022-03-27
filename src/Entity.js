import { Bus, html } from './index.js'
import { forEachKey } from './utilities/IteratorUtils.js'
import { addHandler, getNamespacedEvent } from './utilities/EventUtils.js'
// import { attachDataManager } from './data/DataManager.js'
// import { attachStateManager } from './StateManager.js'
// import { attachReferenceManager } from './ReferenceManager.js'
import Template from './Template.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import Fragment from './Fragment.js'
import Node from './Node.js'

const reservedEventNames = ['mount', 'unmount']

class Entity extends Node {
  #scope
  #parent

  constructor (scope, root, parent) {
    super(root)
    this.#scope = scope
    this.#parent = parent ?? null
  }

  get scope () {
    return `${this.#parent ? `${this.#parent.scope}.` : ''}${this.#scope}`
  }

  emit (evt, ...args) {
    if (!!reservedEventNames.includes(evt)) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    Bus.emit(getNamespacedEvent(this.scope, evt), ...args)
  }

  remove () {
    throw new Error(`Cannot remove node tied to entity`)
  }
}

export function makeEntity (element, cfg, parent, options) {
  const entity = new Entity(cfg.scope, element, parent)
  const template = Reflect.get(cfg, 'template', entity) ?? html``

  if (!(template instanceof Template)) {
    throw new TypeError(`Entity "${entity.scope}" template must return a tagged template literal`)
  }

  return {
    entity,

    async mount () {
      // TODO: Check for any plugins and apply them here

      // attachReferenceManager(entity, cfg.references ?? {})
      // attachDataManager(entity, cfg.data ?? {})
      // attachStateManager(entity, cfg.states ?? null),
      applyEventHandlers(entity, cfg.on ?? {})

      const fragment = new Fragment(entity, template, {
        retainFormatting: options?.retainFormatting ?? entity.tagName === 'PRE'
      })
      
      entity.replaceChildren(await fragment.render())
      await cfg.on?.mount?.call(entity)
    },

    async unmount () {
      children.forEach(child => child.unmount())
      
      BrowserEventRegistry.removeByEntity(entity)
      // TrackerRegistry.removeTrackersByEntity(entity)
      await cfg.on?.unmount?.call(entity)
    }
  }
}

function applyEventHandlers (entity, cfg) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Invalid entity "on" configuration. Expected "object", received "${typeof cfg}"`)
  }

  forEachKey(cfg, (evt, handler) => !reservedEventNames.includes(evt) && addHandler(entity, evt, handler))
}

// on (evt, cb, cfg) {
  //   return addHandler(this, ...arguments)
  // }

  // off (evt, handler) {
  //   NGN.BUS.off(getNamespacedEvent(this.name, evt), handler)
  // }

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