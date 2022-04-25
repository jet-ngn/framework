import Renderer from '../Renderer.js'
import TrackableRegistry, { Trackable } from './TrackableRegistry.js'
import { forEachKey } from '../utilities/IteratorUtils.js'
import { addHandler, getNamespacedEvent } from '../utilities/EventUtils.js'
import { Bus, html } from '../index.js'
import { NANOID } from '@ngnjs/libdata'
import history from 'history'
import { resolveRoute } from '../utilities/RouteUtils.js'

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
  #data
  #routes = {}

  constructor (root, cfg, parent) {
    this.#name = cfg.name ?? `Unnamed Entity`
    this.#scope = cfg.scope ?? this.#id
    this.#root = root
    this.#parent = parent ?? null
    this.#data = cfg.data ? new Trackable(cfg.data) : null
  }

  get children () {
    return this.#children
  }

  get data () {
    return this.#data
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

  get routes () {
    return this.#routes
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

  register (root, config, parent, options) {
    const { boundListeners, routeCfg } = options ?? {}
    const entity = new Entity(...arguments)

    const result = {
      entity,

      mount: (pathname = null) => {
        // TODO: Check if pathname exists, and if so, check if it matches route.
        // If it does, continue
        // If it doesn't, throw an error (this should never happen)

        // if (route) {
        //   const { map, search, hash } = routeCfg ?? {}

        //   history.push({
        //     pathname: resolveRoute(`${parent?.route ? `${parent.route}` : ''}${route}`, map),
        //     search: search ? `?${search}` : '',
        //     hash: hash ? `#${hash}` : ''
        //   })
        // }

        forEachKey(config.on ?? {}, (evt, handler) => {
          if (!reservedEventNames.includes(evt)) {
            addHandler(entity, evt, handler)
          }

          return true
        })

        // TODO: Keep track of entity routes during rendering process
        // Ignore entities that don't have routes
        // If they do have routes, match them against pathname

        const renderer = new Renderer(entity, {
          retainFormatting: root.tagName === 'PRE'
        })

        const template = Reflect.get(config, 'template', entity) ?? html``
        const { content, tasks } = renderer.render(template, pathname)

        root.replaceChildren(content)
        tasks.forEach(task => task())

        boundListeners?.mount && boundListeners.mount.call(entity)
        config.on?.mount?.call(entity)
      },
      
      unmount: () => {
        const { children, id, root } = entity

        children.forEach(child => {
          TrackableRegistry.removeContentTrackersByEntity(child)
          this.unmount(child.id)
        })

        TrackableRegistry.removeContentTrackersByEntity(entity)

        nodes.delete(root)
        delete entities[id]

        boundListeners?.unmount && boundListeners.unmount.call(entity)
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