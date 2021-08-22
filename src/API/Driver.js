import DataManager from '../data/DataManager.js'
import EventManager from '../events/EventManager.js'
import MethodManager from '../methods/MethodManager.js'
import NodeManager from './NodeManager.js'
import PluginManager from '../plugins/PluginManager.js'
import ReferenceManager from '../reference/ReferenceManager.js'
import StateManager from '../states/StateManager.js'
import { createId } from '../Utilities.js'
import Constants from '../Constants.js'
import JobRegistry from '../registries/JobRegistry.js'

export default function Driver (superclass = Object) {
  return class Driver extends superclass {
    #id = createId()
    #name
    #cfg

    #initialized = false
    #manager = null
    #plugins = {}

    #dataManager = null
    #eventManager
    #methodManager = null
    #pluginManager = null
    #referenceManager = null
    #stateManager = null

    event = null

    constructor (name, cfg) {
      super()

      this.#cfg = cfg
      this.#name = cfg.name ?? this.#id

      this.#eventManager = new EventManager(this, cfg.on ?? {})

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

    get id () {
      return this.#id
    }

    get initialized () {
      return this.#initialized
    }

    get manager () {
      return this.#manager
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

    addState (name, cfg) {
      this.#stateManager.addState(...arguments)
    }

    batch () {
      return NodeManager.batch(...arguments)
    }

    // clear () {
    //   this.root.innerHTML = ''
    // }

    // destroy () {
    //   this.root.destroy()
    // }

    emit (evt, ...rest) {
      this.#eventManager.emit(evt, this, ...rest)
    }

    // fetch (path, fallback) {
    //   return { type: Constants.INTERPOLATION_FETCH, path, fallback }
    // }

    getReference (name) {
      return this.#referenceManager.getReference(name, this.root)
    }

    hasReference (name) {
      return this.#referenceManager.hasReference(...arguments)
    }

    hasState (name) {
      return this.#stateManager.hasState(...arguments)
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

    off () {
      this.#eventManager.off(...arguments)
    }

    on () {
      this.#eventManager.on(...arguments, {})
    }

    reinitialize ({ selector, manager, element, data }) {
      this.#initialized = false
      this.root.reset()

      if (!!this.#dataManager) {
        this.#dataManager.clearAttachments()
      }

      if (!!data) {
        this.#bindData(data)
      }

      if (element && element !== this.root.element) {
        this.#referenceManager = new ReferenceManager(this, this.#cfg.references ?? {}, { selector, element })
      } else {
        this.#referenceManager.clear()
      }
  
      this.#eventManager.reset()
      this.emit('initialize')

      setTimeout(() => {
        this.#initialized = true
        this.emit('initialized')
      }, 0)
    }

    removeReference (name) {
      this.#referenceManager.removeReference(name)
    }

    removeState (name) {
      this.#stateManager.removeState(...arguments)
    }

    setState (name, payload, routeConfig) {
      this.#stateManager.setState(...arguments)
    }

    transition (name, payload, routeCfg) {
      this.#stateManager.transition(...arguments)
    }
  
    #bindData = data => {
      if (!this.#dataManager) {
        this.#dataManager = new DataManager(this, {})
      }
  
      this.#dataManager.attach(data)
    }
  }
}
