import Property from './Property.js'

export default class PropertyManager {
  #context
  #cfg
  #initial = []
  #properties = {}
  #isAttributeManager

  constructor (context, properties, isAttributeManager = false) {
    this.#context = context
    this.#cfg = properties
    this.#isAttributeManager = isAttributeManager

    Object.keys(properties).forEach(property => {
      this.add(property, properties[property])
    })
  }

  get properties () {
    return Object.keys(this.#properties).map(name => this.#properties[name])
  }

  get initial () {
    return this.#initial
  }

  add (name, cfg) {
    const property = new Property(this.#context, name, cfg, this.#isAttributeManager)
    this.#properties[name] = property

    if (property.initialValue) {
      this.#initial.push(property)
    }
  }

  get (name) {
    return this.#properties[name]
  }

  set (name, value) {
    const property = this.#properties[name]

    if (!property) {
      return value
    }

    let prefix = this.#isAttributeManager ? 'attribute' : 'property'
    const previous = property.value
    let abort = false

    let payload = {
      current: previous,
      next: value,
      abort: () => abort = true
    }

    this.#context.emit(`${prefix}.${name}.change`, payload)

    this.#context.emit(`${prefix}.change`, {
      name,
      ...payload
    })

    if (abort) {
      return
    }

    property.value = value

    payload = {
      previous,
      current: value
    }

    this.#context.emit(`${prefix}.${name}.changed`, payload)

    this.#context.emit(`${prefix}.changed`, {
      name,
      ...payload
    })

    return property.value
  }

  #parseValue = (property, cfg, value) => {
    value = value ?? cfg.default ?? null
    return [null, undefined].includes(value) ? null : value
  }
}
