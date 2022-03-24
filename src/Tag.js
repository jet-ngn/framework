import { typeOf, NANOID } from '@ngnjs/libdata'
import Constants from './Constants.js'
import Node from './Node.js'
import { makeEntity } from './Entity.js'
import BrowserEventRegistry from './registries/BrowserEventRegistry.js'
import { sanitizeString } from './utilities/StringUtils.js'
import { processList } from './utilities/ListUtils.js'

export default class Tag {
  #id = NANOID()
  #type
  #strings
  #interpolations
  #entity = null
  #attributes = null
  #listeners = null
  #children = {}
  #entityTracker = null

  constructor ({ type, strings, interpolations }) {
    this.#type = type
    this.#strings = strings
    this.#interpolations = interpolations
  }

  get id () {
    return this.#id
  }

  get type () {
    return this.#type
  }

  attr (cfg) {
    this.#attributes = cfg
    return this
  }

  bind (entity) {
    if (entity.type === Constants.Tracker) {
      this.#entityTracker = entity
      return this
    }

    this.#entity = entity
    return this
  }

  on (evt, handler, cfg = null) {
    if (!this.#listeners) {
      this.#listeners = {}
    }

    if (this.#listeners.hasOwnProperty(evt)) {
      this.#listeners[evt].push({ handler, cfg })
    } else {
      this.#listeners[evt] = [{ handler, cfg }]
    }

    return this
  }

  async render (cfg) {
    const template = this.#type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    template.innerHTML = await this.#parse(cfg)

    const parent = cfg.entity
    const { children } = template.content
    const node = children[0]
    const { trackerRegistry } = cfg

    if (this.#entity) {
      await this.#bindEntity(parent, node)
    } else if (this.#entityTracker) {
      await this.#bindEntityTracker(node, trackerRegistry)
    }

    if (this.#attributes) {
      this.#bindAttributes(parent, node, { trackerRegistry })
    }

    if (this.#listeners) {
      this.#bindListeners(parent, node)
    }
    
    await this.#processChildTemplates([...children], cfg)

    return template.content
  }

  // TODO: Handle data attributes and class bindings
  #bindAttributes (context, node, { trackerRegistry }) {
    const attributes = this.#attributes

    for (let name in attributes) {
      const value = attributes[name]

      if (Array.isArray(value)) {
        const list = processList(value)
        
        if (list.some(item => typeof item === 'object' && item.type === Constants.Tracker)) {
          const tracker = trackerRegistry.registerAttributeListWithTrackers(node, name, list)
          return tracker.update()
        }

        return node.setAttribute(name, list.join(' '))
      }
  
      // if (name === 'data') {
      //   processDataAttributes()
      //   continue
      // }
  
      let type = typeOf(value)
  
      if (type === 'object') {
        type = value.type
      }
  
      switch (type) {
        case 'string':
        case 'number':
          node.setAttribute(name, value)
          continue
  
        case 'boolean':
          value && node.setAttribute(name, '')
          continue
  
        case Constants.Tracker: 
          const tracker = trackerRegistry.registerAttributeTracker(node, name, value)
          tracker.update()
          continue
  
        default: throw new TypeError(`Entity "${context.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
      }
    }
  }

  async #bindEntity (context, node) {
    const { mount } = makeEntity(new Node(node), this.#entity, context)
    await mount()
  }

  async #bindEntityTracker (node, trackerRegistry) {
    const tracker = trackerRegistry.registerEntityTracker(node, this.#entityTracker)
    await tracker.update()
  }

  #bindListeners (context, node) {
    for (let evt in this.#listeners) {
      this.#listeners[evt].forEach(({ handler, cfg }) => BrowserEventRegistry.add(context, node, evt, handler, cfg))
    }
  }

  #addChild (tag) {
    this.#children[tag.id] = tag
  }

  #getChild (id) {
    return this.#children[id] ?? null
  }

  async #parse (cfg) {
    let string = ''
    const interpolations = this.#interpolations

    if (interpolations.length === 0) {
      string = this.#strings.join('')
    } else {
      for (let i = 0, { length } = this.#strings; i < length; i++) {
        string += this.#strings[i]

        if (i >= interpolations.length) {
          continue
        }

        string += await this.#parseInterpolation(interpolations[i], cfg) ?? ''
      }
    }

    return string
  }

  async #parseArray (arr, cfg) {
    let result = ''

    for (let i = 0, { length } = arr; i < length; i++) {
      result += await this.#parseInterpolation(arr[i], cfg)
    }

    return result
  }

  async #parseFunction (func, { entity }) {
    const result = func.call(entity)
    this.#addChild(result)
    return await this.#parse(result, arguments[2])
  }

  async #parseInterpolation (interpolation, cfg) {
    if (Array.isArray(interpolation)) {
      return await this.#parseArray(interpolation, cfg)
    }
  
    switch (typeof interpolation) {
      case 'string':
      case 'number': return sanitizeString(`${interpolation}`, cfg)
      case 'boolean': return interpolation ? 'true' : null
      case 'object': return await this.#parseObject(interpolation, cfg)
      case 'function': return await this.#parseFunction(interpolation, cfg)
      default: return null
    }
  }

  async #parseObject (obj, cfg) {
    if (obj instanceof Tag) {
      this.#addChild(obj)
      return `<template class="${obj.type} tag" id="${obj.id}"></template>`
    }
  
    switch (obj.type) {
      case Constants.Tracker:
        const tracker = cfg.trackerRegistry.registerContentTracker(obj)
        return `<template class="${tracker.type} tracker" id="${tracker.id}"></template>`
    
      default: 
        console.warn(obj)
        throw new Error(`Invalid template string interpolation`)
    }
  }

  async #processChildTemplates (nodes, cfg) {
    for (let i = 0, { length } = nodes; i < length; i++) {
      const node = nodes[i]
      
      if (node.tagName !== 'TEMPLATE') {
        await this.#processChildTemplates([...node.children], cfg)
        continue
      }
  
      const { classList } = node
  
      if (classList.contains('tracker')) {
        const fragment = document.createDocumentFragment()
        cfg.trackerRegistry.getNodes(node.id).forEach(node => fragment.append(node))
        node.replaceWith(fragment)
        continue
      }
  
      if (classList.contains('tag')) {
        const tag = this.#getChild(node.id)
        node.replaceWith(await tag.render(arguments[1]))
        continue
      }
  
      throw new Error(`Invalid interpolation`)
    }
  }
}