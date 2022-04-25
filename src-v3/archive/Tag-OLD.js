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

  async render (context, options, collection) {
    const template = this.#type === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('template')

    template.innerHTML = await this.#parse(...arguments)

    const { children } = template.content
    const node = children[0]

    if (this.#entity) {
      await this.#bindEntity(context, node, options, collection)
    } else if (this.#entityTracker) {
      await this.#bindEntityTracker(context, node, options, collection)
    }

    if (this.#attributes) {
      await this.#bindAttributes(context, node)
    }

    if (this.#listeners) {
      this.#bindListeners(context, node)
    }
    
    await this.#processChildTemplates(context, [...children], options, collection)
    return template.content
  }

  // TODO: Handle data attributes and class bindings
  async #bindAttributes (context, node) {
    const attributes = this.#attributes

    for (let name in attributes) {
      const value = attributes[name]

      if (Array.isArray(value)) {
        const list = processList(value)
        
        if (list.some(item => typeof item === 'object' && item.type === Constants.Tracker)) {
          const tracker = TrackerRegistry.registerAttributeListWithTrackers(context, node, name, list)
          return await tracker.update()
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
          const tracker = TrackerRegistry.registerAttributeTracker(context, node, name, value)
          await tracker.update()
          continue
  
        default: throw new TypeError(`Entity "${context.name}" rendering error: Invalid attribute value type "${type ?? typeof value}"`)
      }
    }
  }

  async #bindEntity (context, node, options, collection) {
    const result = makeEntity(new Node(node), this.#entity, context, options)
    collection.push(result)
    await result.mount()
  }

  async #bindEntityTracker (context, node, options, collection) {
    const tracker = TrackerRegistry.registerEntityTracker(context, node, this.#entityTracker, options, collection)
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

  async #parse (context, options) {
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

        string += await this.#parseInterpolation(interpolations[i], ...arguments) ?? ''
      }
    }

    return string
  }

  async #parseArray (arr, context, options) {
    let result = ''

    for (let i = 0, { length } = arr; i < length; i++) {
      result += await this.#parseInterpolation(arr[i], context, options)
    }

    return result
  }

  async #parseFunction (func, { entity }) {
    const result = func.call(entity)
    this.#addChild(result)
    return await this.#parse(result, arguments[2])
  }

  async #parseInterpolation (interpolation, context, options) {
    if (Array.isArray(interpolation)) {
      return await this.#parseArray(...arguments)
    }
  
    switch (typeof interpolation) {
      case 'string':
      case 'number': return sanitizeString(`${interpolation}`, options)
      case 'boolean': return interpolation ? 'true' : null
      case 'object': return await this.#parseObject(...arguments)
      case 'function': return await this.#parseFunction(...arguments)
      default: return null
    }
  }

  async #parseObject (obj, context, options) {
    if (obj instanceof Tag) {
      this.#addChild(obj)
      return `<template class="${obj.type} tag" id="${obj.id}"></template>`
    }
  
    switch (obj.type) {
      case Constants.Tracker:
        const tracker = TrackerRegistry.registerContentTracker(context, obj, options)
        return `<template class="${tracker.type} tracker" id="${tracker.id}"></template>`
    
      default: 
        console.warn(obj)
        throw new Error(`Invalid template string interpolation`)
    }
  }

  async #processChildTemplates (context, nodes, options, collection) {
    for (let i = 0, { length } = nodes; i < length; i++) {
      const node = nodes[i]
      
      if (node.tagName !== 'TEMPLATE') {
        await this.#processChildTemplates(context, [...node.children], options, collection)
        continue
      }
  
      const { classList } = node
  
      if (classList.contains('tracker')) {
        const fragment = document.createDocumentFragment()

        for (let trackedNode of TrackerRegistry.getNodes(node.id)) {
          if (trackedNode instanceof Tag) {
            fragment.append(await trackedNode.render(context, options, collection))
            continue
          }

          fragment.append(trackedNode)
        }

        node.replaceWith(fragment)
        continue
      }
  
      if (classList.contains('tag')) {
        const tag = this.#getChild(node.id)
        node.replaceWith(await tag.render(context, options, collection))
        continue
      }
  
      throw new Error(`Invalid interpolation`)
    }
  }
}