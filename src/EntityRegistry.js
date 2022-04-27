import Renderer from './Renderer.js'
import Entity from './Entity.js'
import TrackableRegistry from './TrackableRegistry.js'
import { INTERNAL_ACCESS_KEY } from './globals.js'
import EventRegistry from './EventRegistry.js'

const entities = {}
const nodes = new Map

export default class EntityRegistry {
  static get (id) {
    return entities[id] ?? null
  }

  static getEntryByNode (node) {
    return nodes.get(node)
  }

  static register ({ parent, root, config, options }) {
    const entity = new Entity(parent, root, config)
    const { listeners, route } = options ?? {}
    
    const record = {
      entity,
      
      mount: (...args) => {
        const template = config.render?.apply(entity, args)

        if (!template) {
          throw new Error(`Entity "${entity.name ?? entity.id}": No template specified`)
        }

        const renderer = new Renderer(entity, {
          retainFormatting: root.tagName === 'PRE'
        })

        const { content, tasks } = renderer.render(template)
        
        root.replaceChildren(content)
        tasks.forEach(task => task())

        // listeners?.mount && listeners.mount.call(entity)
        entity.emit(INTERNAL_ACCESS_KEY, 'mount', ...args)
        // config.on?.mount?.apply(entity, args)
      },

      unmount: () => {
        const { children, id, root } = entity

        EventRegistry.removeAllByEntity(entity)

        children.forEach(child => {
          TrackableRegistry.removeContentTrackersByEntity(child)
          this.unmount(child.id)
        })

        TrackableRegistry.removeContentTrackersByEntity(entity)

        nodes.delete(root)
        delete entities[id]

        // listeners?.unmount && listeners.unmount.call(entity)
        entity.emit(INTERNAL_ACCESS_KEY, 'unmount')
        // config.on?.unmount?.call(entity)
      }
    }

    entities[entity.id] = record
    return record
  }
}