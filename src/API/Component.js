import Template from '../renderer/Template.js'
import CSSParser from '../parser/CSSParser.js'
import Renderer from '../renderer/Renderer.js'
import { DOMEventRegistry } from '../registries/DOMEventRegistry.js'
import { createId } from '../Utilities.js'

import AttributeManager from '../attributes/AttributeManager.js'
import EventManager from '../events/EventManager.js'
import MethodManager from '../methods/MethodManager.js'
import NodeManager from './NodeManager.js'
import PluginManager from '../plugins/PluginManager.js'
import DataManager from '../data/DataManager.js'
import ReferenceManager from '../reference/ReferenceManager.js'
import StateManager from '../states/StateManager.js'

const CustomElement = superClass => class extends superClass {
  #id = createId()
  #name
  #cfg
  #initialized = false
  #connected = false

  #manager
  #attributeManager
  #dataManager
  #eventManager
  #methodManager
  #pluginManager
  #referenceManager
  #stateManager

  constructor (tag, cfg) {
    super()
    this.#cfg = cfg
    this.#name = `${tag}.${this.attributes.item('key')?.value ?? this.#id}`
    this.#attributeManager = new AttributeManager(this, cfg.attributes ?? {})

    this.#eventManager = new EventManager(this, cfg.on ?? {})

    if (Object.keys(cfg.data ?? {}).length > 0) {
      this.#dataManager = new DataManager(this, cfg.data)
      // this.#dataManager.initialize()
    }

    if (Object.keys(cfg.methods ?? {}).length > 0) {
      this.#methodManager = new MethodManager(this, cfg.methods)
    }

    this.#stateManager = new StateManager(this, cfg.states, cfg.initialState ?? 'idle')

    if (cfg.plugins?.length > 0) {
      this.#pluginManager = new PluginManager(this, cfg.plugins)
    }
  }

  get connected () {
    return this.#connected
  }

  get config () {
    return this.#cfg
  }

  get data () {
    return this.#dataManager?.data ?? null
  }

  get events () {
    return this.#eventManager.events
  }

  get initialized () {
    return this.#initialized
  }

  get methods () {
    return this.#methodManager ?? null
  }

  get name () {
    return this.#name
  }

  get manager () {
    return this.#manager
  }

  get namespace () {
    return `${this.#manager ? `${this.#manager.namespace}.` : ''}${this.name}`
  }

  get plugins () {
    return this.#pluginManager?.plugins ?? null
  }

  get references () {
    return this.#referenceManager.references
  }

  get refs () {
    return this.references
  }

  get root () {
    return this.#referenceManager.getReference('root')
  }

  get state () {
    return this.#stateManager?.currentState?.name ?? 'idle'
  }

  set state (name) {
    this.#stateManager.setState(name)
  }

  get states () {
    return this.#stateManager.states
  }

  get type () {
    return 'component'
  }

  addReference (name, node) {
    return this.#referenceManager.addReference(...arguments)
  }

  addState (name, cfg) {
    this.#stateManager.addState(...arguments)
  }

  attributeChangedCallback (name, previous, current) {
    if (this.#initialized) {
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
    if (this.#attributeManager) {
      this.#attributeManager.initial.forEach(({ name, value }) => this.setAttribute(name, value))
    }

    this.#connected = true
    this.dispatchEvent(new CustomEvent('connected'))
    this.emit('connected')
  }

  disconnectedCallback () {
    this.dispatchEvent(new CustomEvent('disconnected'))
    this.emit('disconnected')
  }

  emit (evt, ...rest) {
    this.#eventManager.emit(evt, this, ...rest)
  }

  getReference (name) {
    return this.#referenceManager.getReference(name, this.root)
  }

  hasReference (name) {
    return this.#referenceManager.hasReference(...arguments)
  }

  hasState (name) {
    return this.#stateManager.hasState(...arguments)
  }

  initialize (manager) {
    if (this.#initialized) {
      throw new Error(`${this.constructor.name} "${this.namespace}" already initialized`)
    }

    this.#manager = manager
    this.#referenceManager = new ReferenceManager(this, this.#cfg.references ?? {}, { element: this })
    this.#eventManager.initialize()

    this.emit('initialize')
    this.#stateManager.initialize()

    if (this.#pluginManager) {
      this.#pluginManager.initialize()
      // this.plugins.map(plugin => {
      //   this.#plugins[plugin.name] = plugin.initialize(this, this.#cfg)
      // })
    }

    this.#initialized = true
    this.emit('initialized')
  }

  off () {
    this.#eventManager.off(...arguments)
  }

  on (evt, cb, cfg) {
    this.#eventManager.on(...arguments)
  }

  removeReference (name) {
    this.#referenceManager.removeReference(name)
  }

  removeState (name) {
    this.#stateManager.removeState(...arguments)
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

  setState (state, payload, routeConfig) {
    this.#stateManager.setState(...arguments)
  }

  transition (action, payload, routeCfg) {
    this.#stateManager.transition(...arguments)
  }

  #bindData = data => {
    if (!this.dataManager) {
      this.#dataManager = new DataManager(this, {})
      // this.#dataManager.initialize()
    }

    Object.keys(data).forEach(key => this.#dataManager.attach(key, data[key]))
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
      return ['key', ...(cfg.observedAttributes ?? [])]
    }

    get retainFormatting () {
      return this.#retainFormatting
    }

    addChildEventListener (element, evt, cb) {
      this.#eventRegistry.register(this, ...arguments, {})
    }

    batch () {
      return NodeManager.batch(...arguments)
    }

    bind () {
      return NodeManager.bind(this, ...arguments, this.#retainFormatting)
    }
  }

  customElements.define(tag, Component)
  return Component
}
