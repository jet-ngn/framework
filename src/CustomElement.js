import { attachEventManager, applyEventHandlers } from './EventManager.js'
import { compose } from './utilities.js'

export function defineCustomElement (tag, cfg) {
  const { on } = cfg

  const properties = {
    id: Symbol()
  }

  class CustomElement extends (cfg.extends ?? HTMLElement) {
    // Add standard methods
  }

  // TODO: Add cfg.methods here too
  // compose(CustomElement.prototype, EventManager(properties, on))

  customElements.define(tag, CustomElement)
}