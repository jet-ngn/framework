export default class Property {
  #context
  #name
  #cfg
  #initialValue
  #type
  #value
  #validValues
  #defaultValue
  #isAttribute

  constructor (context, name, cfg, isAttribute = false) {
    this.#context = context
    this.#name = name
    this.#cfg = cfg
    this.#defaultValue = cfg.default ?? null
    this.#initialValue = cfg.initial ?? null
    this.#type = cfg.type ?? String
    this.#value = this.#parseValue(this.#initialValue)
    this.#validValues = cfg.valid ?? null
    this.#isAttribute = isAttribute
  }

  get defaultValue () {
    return this.#defaultValue
  }

  get initialValue () {
    return this.#initialValue
  }

  get isAttribute () {
    return false
  }

  get name () {
    return this.#name
  }

  get type () {
    return this.#type
  }

  get value () {
    return this.#value
  }

  set value (value) {
    this.#value = this.#parseValue(value)
  }

  #parseValue = value => {
    value = value === '' ? this.#cfg.default : (value ?? this.#cfg.default ?? null)

    if (this.#type === Boolean && ['true', 'false'].includes(value)) {
      value = value === 'true'
    }

    if (!!value) {
      if (value.constructor !== this.#type) {
        throw new Error(`Custom Element <${this.#context.nodeName.toLowerCase()}> "${this.#context.name}:" ${this.#isAttribute ? 'Attribute' : 'Property'} "${this.#name}" expected a value of type "${this.#type.name.toLowerCase()}", received "${NGN.typeof(value)}"`)
      } else if (this.#validValues && !this.#validValues.includes(value)) {
        throw new Error(`Custom Element <${this.#context.nodeName.toLowerCase()}> "${this.#context.name}:" ${this.#isAttribute ? 'Attribute' : 'Property'} "${this.#name}" expected one of the following values: "${this.#validValues.join('", "')}". Received "${value}"`)
      }
    }

    return [null, undefined].includes(value) ? null : value
  }
}
