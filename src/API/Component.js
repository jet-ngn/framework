import Driver from './Driver.js'
import AttributeManager from '../attributes/AttributeManager.js'
import NodeManager from './NodeManager.js'
import ComponentRegistry from '../registries/ComponentRegistry.js'

import Template from '../renderer/Template.js'
import CSSParser from '../parser/CSSParser.js'
import Renderer from '../renderer/Renderer.js'
import { DOMEventRegistry } from '../registries/DOMEventRegistry.js'

const CustomElement = superClass => class extends Driver(superClass) {
  #connected = false
  #attributeManager

  constructor (tag, cfg) {
    super(...arguments)
    this.#attributeManager = new AttributeManager(this, cfg.attributes ?? {})
  }

  get connected () {
    return this.#connected
  }

  get type () {
    return 'component'
  }

  attributeChangedCallback (name, previous, current) {
    if (this.initialized) {
      const attribute = this.#attributeManager.getAttribute(name)

      if (attribute.type === Boolean) {
        previous = previous === ''
        current = current === ''
      }
    }

    if (previous !== current) {
      this.emit('attribute.changed', { name, value: { previous, current } })
    }
  }

  connectedCallback () {
    this.#attributeManager.initial.forEach(({ name, value }) => {
      if (!this.hasAttribute(name)) {
        return this.setAttribute(name, value)
      }
    })

    this.#attributeManager.attributes.forEach(({ name, type, value }) => {
      if (type !== Boolean || !this.hasAttribute(name)) {
        return
      }

      const initialValue = this.getAttribute(name)

      if (['true', ''].includes(initialValue.trim())) {
        return this.setAttribute(name, true)
      }

      this.removeAttribute(name)
    })

    this.#connected = true
    this.dispatchEvent(new CustomEvent('connected'))
    this.emit('connected')
  }

  disconnectedCallback () {
    this.dispatchEvent(new CustomEvent('disconnected'))
    this.emit('disconnected')
  }

  initialize (cfg = {}) {
    super.initialize({ element: this, ...cfg })
  }

  setAttribute (name, value) {
    value = this.#attributeManager.setAttribute(name, value)

    if ([null, false].includes(value)) {
      return super.removeAttribute(name)
    }

    if (value === true) {
      return super.setAttribute(name, '')
    }

    super.setAttribute(name, value)
  }
}

export default function Component (tag, cfg) {
  if (!!customElements.get(tag)) {
    throw new Error(`Custom Element "${tag}" already exists`)
  }

  if (NGN.typeof(cfg) !== 'object') {
    throw new TypeError(`Component Configuration: Expected object, but received ${NGN.typeof(cfg)}`)
  }

  class Component extends CustomElement(cfg.base ?? HTMLElement) {
    #template
    #retainFormatting
    #eventRegistry

    constructor () {
      super(tag, cfg)
      
      if (!this.shadowRoot) {
        this.attachShadow({ mode: cfg.mode ?? 'open' })
      }

      this.#eventRegistry = new DOMEventRegistry(this.shadowRoot)
      this.#retainFormatting = cfg.retainFormatting ?? false

      const tags = {
        style: Reflect.get(cfg, 'style', this) ?? null,
        template: Reflect.get(cfg, 'template', this) ?? null
      }

      const template = document.createElement('template')

      if (tags.style) {
        template.innerHTML = `
          <style>
            ${CSSParser.parse(tags.style)}
          </style>
        `
      }

      this.#template = new Template(this, tags.template, this.#retainFormatting)
      template.content.append(Renderer.appendNodes(document.createDocumentFragment(), this.#template))
      this.shadowRoot.append(template.content)
    }

    static get observedAttributes () {
      return Object.keys(cfg.attributes ?? {}).reduce((observed, name) => {
        if (cfg.attributes[name].observed) {
          observed.push(name)
        }

        return observed
      }, [])
    }

    get retainFormatting () {
      return this.#retainFormatting
    }

    addChildEventListener (element, evt, cb) {
      this.#eventRegistry.register(this, ...arguments, {})
    }

    bind () {
      return NodeManager.bind(this, ...arguments, this.#retainFormatting)
    }
  }

  ComponentRegistry.add(tag, Component)
  customElements.define(tag, Component)
  return Component
}
