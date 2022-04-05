import Renderer from '../Renderer.js'
import { forEachKey } from '../utilities/IteratorUtils.js'
import { addHandler } from '../utilities/EventUtils.js'
import { html } from '../index.js'
import Entity from '../Entity.js'

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

  register (root, config, parent) {
    const entity = new Entity(...arguments)

    const result = {
      entity,

      mount: () => {
        console.log('MOUNT ', entity.name, entity)
        forEachKey(config.on ?? {}, (evt, handler) => !reservedEventNames.includes(evt) && addHandler(entity, evt, handler))

        const renderer = new Renderer(entity, {
          retainFormatting: root.tagName === 'PRE'
        })

        const template = Reflect.get(config, 'template', entity) ?? html``
        const { content, tasks } = renderer.render(template)

        root.replaceChildren(content)
        tasks.forEach(task => task())
        config.on?.mount?.call(entity)
      },
      
      unmount: () => {
        console.log('UNMOUNT ', entity.name, entity)
        const { children, id, root } = entity
        children.forEach(child => this.unmount(child.id))

        // TrackerRegistry.removeTrackersByEntity(entity)

        nodes.delete(root)
        delete entities[id]

        config.on?.unmount?.call(entity)
      }
    }

    nodes.set(entity.root, result)
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

  unmountByNode (node) {
    const { unmount } = this.getEntryByNode(node)
    unmount && unmount()
  }
}

export default new EntityRegistry