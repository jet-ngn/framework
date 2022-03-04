import Driver from './Driver.js'
import NodeManager from './NodeManager.js'
import ReferenceElement from '../reference/ReferenceElement.js'
import { CompositionUtils } from '../Utilities.js'

export default class Entity extends Driver() {
  #manages
  #selector

  // #routeManager

  constructor (cfg) {
    if (NGN.typeof(cfg) !== 'object') {
      throw new TypeError(`Entity Configuration: Expected object, but received ${NGN.typeof(cfg)}`)
    }

    const { composes } = cfg
    delete cfg.composes

    if (Array.isArray(composes) && composes.length > 0) {
      cfg = CompositionUtils.composeConfigs(cfg, ...composes)
    }

    super(cfg.name, cfg)

    this.#manages = cfg.manages ?? []
    this.#selector = this.config.selector ?? null

    // TODO: Add NGN.Ledger event for Entity creation
    // This could be used by Jet DevTools to index all Entities within the app
  }

  get manages () {
    return this.#manages
  }

  get selector () {
    return !!this.#selector ? (
      this.#selector.startsWith('#') ? this.#selector : `${this.manager ? `${this.manager.selector} ` : ''}${this.#selector}`
    ) : null
  }

  // get route () {
  //   return this.#routeManager.currentRoute
  // }

  get type () {
    return 'entity'
  }

  append (tag) {
    // TODO: Add NGN.Ledger Event
    return this.root.append(...arguments)
  }

  bind (cfg, target) {
    if (target instanceof ReferenceElement) {
      return NodeManager.bindRef(this, ...arguments)
    }

    return NodeManager.bind(this, ...arguments, this.root.retainFormatting)
  }

  extend (cfg) {
    return new Entity({ ...this.config, ...cfg })
  }

  initialize (cfg = {}) {
    if (this.#manages.length > 0) {
      this.#manages.forEach(entity => entity.initialize({ manager: this }))
    }

    super.initialize({ selector: this.selector, ...cfg })
  }

  // Monkey Patch: remove a child DOM element manually, and also remove it's Virtual Node
  // on the Renderer
  removeChildElement (element) {
    return this.root.removeChildElement(element)
  }

  render (tag) {
    // TODO: Add NGN.Ledger Event
    return this.root.render(...arguments)
  }

  replace (tag) {
    // TODO: Add NGN.Ledger Event
    return this.root.replace(...arguments)
  }
}