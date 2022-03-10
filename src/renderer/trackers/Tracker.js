import { UUID } from '@ngnjs/libdata'

export default class Tracker {
  id = UUID()
  nodes

  constructor ({ target, property, transform }, { retainFormatting }) {
    if (!property || typeof property === 'function') {
      throw new Error(`Invalid Tracker configuration. Expected a property name, recieved "${typeof property}"`)
    }

    this.target = target
    this.property = property
    this.initialValue = target[property]
    this.transform = transform
    this.retainFormatting = retainFormatting
  }

  get value () {
    const value = this.target[this.property]
    return this.transform ? this.transform(value) : value
  }
  
  update (cb) {
    this.nodes.forEach(cb)
  }
}