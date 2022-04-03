import Renderer from '../Renderer.js'
import { forEachKey } from '../utilities/IteratorUtils.js'
import { addHandler } from '../utilities/EventUtils.js'

const reservedEventNames = ['mount', 'unmount']

class EntityRegistry {
  #entities = {}

  get entities () {
    return this.#entities
  }

  get (id) {
    return this.#entities[id] ?? null
  }

  async register (entity) {
    const { root, config, children } = entity

    this.#entities[entity.id] = {
      entity,

      mount: async () => {
        forEachKey(config.on ?? {}, (evt, handler) => !reservedEventNames.includes(evt) && addHandler(entity, evt, handler))

        const renderer = new Renderer(entity, {
          retainFormatting: root.tagName === 'PRE'
        })
    
        const content = await renderer.render(Reflect.get(config, 'template', entity) ?? html``)
        delete config.template
        
        for (let child of children) {
          await this.mount(child.id)
        }

        entity.root.replaceChildren(content)
        await config.on?.mount?.call(entity)
      },
      
      unmount: async () => {
        // children.forEach(child => child.unmount())
        // BrowserEventRegistry.removeByEntity(entity)
        // TrackerRegistry.removeTrackersByEntity(entity)
        await config.on?.unmount?.call(entity)
      }
    }
  }

  async mount (id) {
    const { mount } = this.#entities[id] ?? {}
    mount && await mount()
  }

  async unmount (id) {
    const { unmount } = this.#entities[id] ?? {}
    unmount && await unmount()
  }
}

export default new EntityRegistry