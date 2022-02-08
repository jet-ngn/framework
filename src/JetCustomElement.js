import { typeOf } from 'NGN/libdata'
import Driver from './Driver.js'

function JetBaseCustomElement (superclass = HTMLElement) {
  return class JetBaseCustomElement extends Driver(superclass) {
    #connected = false

    constructor (cfg) {
      super(cfg)
    }
  }
}

export default class JetCustomElement {
  constructor (cfg) {
    if (typeOf(cfg) !== 'object') {
      throw new TypeError(`Jet Custom Element Configuration: Expected object, but received ${typeOf(cfg)}`)
    }

    return class JetCustomElement extends JetBaseCustomElement(cfg.base) {
      constructor () {
        super(cfg)
      }
    }
  }
}