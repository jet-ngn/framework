import Renderer from './Renderer.js'
import Entity from './Entity.js'
import Template from './Template.js'

const entities = {}

function mount ({ entity, template, root, route, options }) {
  
}

export default class EntityRegistry {
  static register ({ parent, root, config, options }) {
    const entity = new Entity(parent, root, config)
    
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

        // console.log(options)
        // // const { listeners, route } = options ?? {}
        config.on?.mount?.apply(entity, args)
      },

      unmount: () => this.unmount(entity)
    }

    entities[entity.id] = record
    return record
  }
}