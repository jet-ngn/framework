import { getTemplateRenderingTasks } from '../src/lib/rendering/Renderer'
import Bus, { addHandler } from '../src/lib/events/Bus'
import { createId } from '../src/utilities/IDUtils'
import { RESERVED_EVENT_NAMES } from '../src/env'

// WIP!

export function createComponent (tag, cfg) {
  if (customElements.get(tag)) {
    throw new Error(`Custom Element "${tag}" already exists`)
  }

  const options = {}

  if (cfg.extends) {
    options.extends = cfg.extends
  }

  class Component extends getComponent(options.extends ? getInterface(options.extends) : HTMLElement) {
    constructor () {
      super(tag, cfg)
    }

    static get observedAttributes () {
      return Object.keys(cfg.attributes ?? {})
    }
  }
  
  customElements.define(tag, Component, options)
}

function getComponent (superclass) {
  return class extends superclass {
    #attributes
    #data
    #description
    #name
    #scope
    #tag
    #version

    #onBeforeMount
    #onMount

    constructor (tag, { attributes, data, description, name, on, render, style, version }) {
      super()

      tag = tag.toLowerCase()

      this.#attributes = attributes ?? {}
      this.#data = data ? registerState(data) : null
      this.#description = description ?? null
      this.#name = name ?? `${tag}${version ? `@${version}` : ''}`
      this.#scope = createId({ prefix: tag })
      this.#tag = tag
      this.#version = version ?? null

      this.attachShadow({ mode: 'open' })

      const tasks = getTemplateRenderingTasks(this, render.call(this))

      console.log(tasks);

      // this.shadowRoot.append(document.createElement('slot'))
      // this.shadowRoot.append(render ? processTemplate(null, render.call(this)) : document.createElement('slot'))

      Object.keys(on ?? {}).forEach(evt => {
        !RESERVED_EVENT_NAMES.includes(evt) && addHandler(this, evt, on[evt])
      })

      this.#onBeforeMount = on['beforeMount'] ?? null
      this.#onMount = on['mount'] ?? null

      this.emit('beforeMount')
      !!this.#onBeforeMount && this.#onBeforeMount()
    }

    get data () {
      return this.#data
    }

    get description () {
      return this.#description
    }

    get name () {
      return this.#name
    }

    get rootNode () {
      return this
    }

    get scope () {
      return this.#scope
    }

    get version () {
      return this.#version
    }

    attributeChangedCallback (name, previous, current) {
      console.log(...arguments)
    }

    connectedCallback () {
      this.emit('mount')
      this.#onMount && this.#onMount.call(this)
    }

    emit (evt, ...args) {
      let key = null
  
      if (typeof evt === 'symbol') {
        key = evt
        evt = args[0]
        args = args.slice(1)
      }
  
      if (!!RESERVED_EVENT_NAMES.includes(evt) && key !== INTERNAL_ACCESS_KEY) {
        throw new Error(`Invalid event name: "${evt}" is reserved by Jet for internal use`)
      }
  
      Bus.emit(`${this.scope}.${evt}`, ...args)
    }

    find (selector) {
      selector = selector.trim()
      return [...this.querySelectorAll(`${selector.startsWith('>') ? `:scope ` : ''}${selector}`)]
    }
  }
}

function getInterface (tag) {
  const { constructor } = document.createElement(tag)
  return constructor
}