import Renderer from '../Renderer.js'
import { forEachKey } from '../utilities/IteratorUtils.js'
import { addHandler, getNamespacedEvent } from '../utilities/EventUtils.js'
import { Bus, html } from '../index.js'
import { NANOID } from '@ngnjs/libdata'

export const reservedEventNames = ['mount', 'unmount']
const entities = {}
const nodes = new Map

class Entity {
  #id = NANOID()
  #name
  #scope
  #root
  #parent
  #children = []

  constructor (root, cfg, parent) {
    this.#name = cfg.name ?? `Unnamed Entity`
    this.#scope = cfg.scope ?? this.#id
    this.#root = root
    this.#parent = parent ?? null
  }

  get children () {
    return this.#children
  }

  get id () {
    return this.#id
  }

  get name () {
    return this.#name
  }

  get parent () {
    return this.#parent
  }

  get root () {
    return this.#root
  }

  get scope () {
    return `${this.parent ? `${this.parent.scope}.` : ''}${this.#scope}`
  }

  emit (evt, ...args) {
    if (!!reservedEventNames.includes(evt)) {
      throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
    }

    Bus.emit(getNamespacedEvent(this.scope, evt), ...args)
  }
}

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
        // console.log('MOUNT ', entity.name, entity)
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
        // console.log('UNMOUNT ', entity.name, entity)
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
    const { unmount } = this.getEntryByNode(node) ?? {}
    unmount && unmount()
  }
}

export default new EntityRegistry