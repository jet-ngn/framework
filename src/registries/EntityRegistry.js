import Renderer from '../Renderer.js'
import { forEachKey } from '../utilities/IteratorUtils.js'
import { addHandler } from '../utilities/EventUtils.js'
import { html } from '../index.js'

const reservedEventNames = ['mount', 'unmount']
const entities = {}
const nodes = new Map

class EntityRegistry {
  get entities () {
    return entities
  }

  get (id) {
    return entities[id] ?? null
  }

  getEntryByNode (node) {
    return nodes.get(node)
  }

  register (entity, config) {
    const { root, children } = entity

    const result = {
      entity,

      mount: () => {
        forEachKey(config.on ?? {}, (evt, handler) => !reservedEventNames.includes(evt) && addHandler(entity, evt, handler))

        const renderer = new Renderer(entity, {
          retainFormatting: root.tagName === 'PRE'
        })

        entity.root.replaceChildren(renderer.render(Reflect.get(config, 'template', entity) ?? html``))
        config.on?.mount?.call(entity)
      },
      
      unmount: () => {
        entity.children.forEach(child => this.unmount(child.id))

        // TrackerRegistry.removeTrackersByEntity(entity)

        nodes.delete(entity.root)
        delete entities[entity.id]

        config.on?.unmount?.call(entity)
      }
    }

    nodes.set(root, result)
    entities[entity.id] = result
    return result
  }

  mount (id) {
    const { mount } = entities[id] ?? {}
    mount && mount()
  }

  unmount (id) {
    const { unmount } = entities[id] ?? {}
    unmount && unmount()
  }
}

export default new EntityRegistry