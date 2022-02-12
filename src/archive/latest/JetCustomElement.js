import { typeOf } from 'NGN/libdata'
import Entity from './Entity.js'

function JetBaseCustomElement (superclass = HTMLElement) {
  return class JetBaseCustomElement extends Entity(superclass) {
    #connected = false

    // constructor (cfg) {
    //   super(cfg)
    // }
  }
}

export default class JetCustomElement {
  constructor (cfg) {
    if (typeOf(cfg) !== 'object') {
      throw new TypeError(`Jet Custom Element Configuration: Expected object, but received ${typeOf(cfg)}`)
    }

    return class JetCustomElement extends JetBaseCustomElement(cfg.extends) {
      // constructor () {
      //   super(cfg)
      // }
    }
  }
}