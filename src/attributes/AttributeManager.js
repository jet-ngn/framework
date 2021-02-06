import Attribute from './Attribute.js'

export default class AttributeManager {
  #context
  #cfg
  #initial = []
  #attributes = {}

  constructor (context, attributes) {
    this.#context = context
    this.#cfg = attributes

    Object.keys(attributes).forEach(attribute => {
      this.addAttribute(attribute, attributes[attribute])
    })
  }

  get initial () {
    return this.#initial
  }

  addAttribute (name, cfg) {
    const attribute = new Attribute(this.#context, name, cfg)
    this.#attributes[name] = attribute

    if (attribute.initialValue) {
      this.#initial.push(attribute)
    }
  }

  getAttribute (name) {
    return this.#attributes[name]
  }

  setAttribute (name, value) {
    const attribute = this.#attributes[name]

    if (!attribute) {
      return value
    }

    attribute.value = value
    return attribute.value
  }

  #parseValue = (attribute, cfg, value) => {
    value = value ?? cfg.default ?? null
    return [null, undefined].includes(value) ? null : value
  }
}
