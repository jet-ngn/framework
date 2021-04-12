import DataManager from '../data/DataManager.js'
import EventManager from '../events/EventManager.js'
import MethodManager from '../methods/MethodManager.js'
import NodeManager from './NodeManager.js'
import PluginManager from '../plugins/PluginManager.js'
import ReferenceManager from '../reference/ReferenceManager.js'
import ReferenceElement from '../reference/ReferenceElement.js'
import StateManager from '../states/StateManager.js'
import { createId } from '../Utilities.js'

export default class Driver {
  #cfg

  #id = createId()
  #name
  #manager = null
  #initialized = false
  // #plugins = {}
  #manages

  #eventManager = null
  #methodManager = null
  #pluginManager = null
  #dataManager = null
  #referenceManager = null
  #stateManager = null

  constructor (cfg) {
    this.#cfg = cfg
    this.#name = cfg.name ?? this.#id
    this.#eventManager = new EventManager(this, cfg.on ?? {})
    this.#manages = cfg.manages ?? []

    if (Object.keys(cfg.methods ?? {}).length > 0) {
      this.#methodManager = new MethodManager(this, cfg.methods)
    }

    if (Object.keys(cfg.data ?? {}).length > 0) {
      this.#dataManager = new DataManager(this, cfg.data)
    }

    this.#stateManager = new StateManager(this, cfg.states, cfg.initialState ?? 'idle')

    if (cfg.plugins?.length > 0) {
      this.#pluginManager = new PluginManager(this, cfg.plugins)
    }
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

  get namespace () {
    return `${this.#manager ? `${this.#manager.namespace}.` : ''}${this.#name}`
  }

  get manager () {
    return this.#manager
  }

  get manages () {
    return this.#manages
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

  get route () {
    return this.#stateManager.currentRoute
  }

  get root () {
    return this.#referenceManager.getReference('root')
  }

  get state () {
    return this.#stateManager.currentState.name
  }

  set state (name) {
    this.#stateManager.setState(name)
  }

  get states () {
    return this.#stateManager.states
  }

  addReference (name, node) {
    return this.#referenceManager.addReference(...arguments)
  }

  batch () {
    return NodeManager.batch(...arguments)
  }

  bind (cfg, target) {
    if (target instanceof ReferenceElement) {
      return NodeManager.bindRef(cfg, target)
    }

    return NodeManager.bind(this, ...arguments, this.root.retainFormatting)
  }

  clear () {
    this.root.innerHTML = ''
  }

  getReference (name) {
    return this.#referenceManager.getReference(name, this.root)
  }

  hasReference (name) {
    return this.#referenceManager.hasReference(...arguments)
  }

  removeReference (name) {
    this.#referenceManager.removeReference(name)
  }

  destroy () {
    this.root.remove()
  }

  emit (evt, ...rest) {
    this.#eventManager.emit(evt, this, ...rest)
  }

  on () {
    this.#eventManager.on(...arguments, {})
  }

  off () {
    this.#eventManager.off(...arguments)
  }

  initialize ({ selector, manager, element, data }) {
    if (this.#initialized) {
      throw new Error(`${this.constructor.name} "${this.namespace}" already initialized`)
    }

    this.#manager = manager ?? null
    this.#referenceManager = new ReferenceManager(this, this.#cfg.references ?? {}, { selector, element })
    this.#eventManager.initialize()

    if (!!data) {
      this.#bindData(data)
    }

    this.emit('initialize')
    this.#stateManager.initialize()

    if (this.#manages.length > 0) {
      this.#manages.forEach(entity => entity.initialize({ manager: this }))
    }

    if (this.#pluginManager) {
      this.#pluginManager.initialize()
      // this.plugins.map(plugin => {
      //   this.#plugins[plugin.name] = plugin.initialize(this, this.#cfg)
      // })
    }

    setTimeout(() => {
      this.#initialized = true
      this.emit('initialized')
    }, 0)
  }

  reinitialize ({ selector, manager, element, data }) {
    this.#initialized = false

    if (!!data) {
      this.#bindData(data)
    }

    this.#referenceManager.clear()
    this.#eventManager.reset()

    if (element && element !== this.root.element) {
      console.log('TODO: REPLACE');
    }

    this.emit('initialize')

    setTimeout(() => {
      this.#initialized = true
      this.emit('initialized')
    }, 0)
  }

  append (tag) {
    return this.root.append(...arguments)
  }

  render (tag) {
    // TODO: Add NGN.Ledger Event
    return this.root.render(...arguments)
  }

  replace (tag) {
    return this.root.replace(...arguments)
  }

  addState (name, cfg) {
    this.#stateManager.addState(...arguments)
  }

  removeState (name) {
    this.#stateManager.removeState(...arguments)
  }

  hasState (name) {
    return this.#stateManager.hasState(...arguments)
  }

  setState (state, payload, routeConfig) {
    this.#stateManager.setState(...arguments)
  }

  transition (action, payload, routeCfg) {
    this.#stateManager.transition(...arguments)
  }

  #bindData = data => {
    if (!this.#dataManager) {
      this.#dataManager = new DataManager(this, {})
    }

    this.#dataManager.attach(data)
  }
}
