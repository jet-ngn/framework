import Driver from './Driver.js'

export default class Entity extends Driver {
  // #autoInit
  #selector

  constructor (plugins, cfg = {}) {
    if (NGN.typeof(cfg) !== 'object') {
      throw new TypeError(`Entity Configuration: Expected object, but received ${NGN.typeof(cfg)}`)
    }

    super(...arguments)
    // this.#autoInit = cfg.autoInit ?? false
    this.#selector = this.config.selector ?? null

    // if (this.#selector && this.#autoInit) {
    //   const element = document[this.selector.startsWith('#') ? 'getElementById' : 'querySelector'](this.selector)
    //   this.initialize()
    // }

    // TODO: Add NGN.Ledger event for Entity creation
    // This could be used by Jet DevTools to index all Entities within the app
  }

  get selector () {
    return !!this.#selector ? (
      this.#selector.startsWith('#') ? this.#selector : `${this.manager ? `${this.manager.selector} ` : ''}${this.#selector}`
    ) : null
  }

  get type () {
    return 'entity'
  }

  extend (cfg) {
    return new Entity({ ...this.config, ...cfg })
  }

  initialize (cfg = {}) {
    super.initialize({ selector: this.selector, ...cfg })
  }
}
