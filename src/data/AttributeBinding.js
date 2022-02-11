import Constants from '../Constants.js'
import DataBindingInterpolation from '../interpolation/DataBindingInterpolation.js'
import HTMLParser from '../parser/HTMLParser.js'
import DataBindingRegistry from '../registries/DataBindingRegistry.js'

export default class AttributeBinding {
  #element
  #cfg
  #addedClasses = []

  constructor (element, cfg) {
    this.#element = element
    this.#cfg = cfg ?? {}
  }

  get processed () {
    const processed = this.#processCfg(this.#cfg)

    if (this.#addedClasses.length > 0) {
      processed.class = processed.hasOwnProperty('class')
        ? [...processed.class, ...this.#addedClasses]
        : this.#addedClasses
    }

    return processed
  }

  get hasAttributes () {
    return [...Object.keys(this.#cfg), ...this.#addedClasses].length > 0
  }

  addClass (className) {
    this.#addedClasses.push(className)
  }

  #bind = (attribute, { model, field, process }, namespace) => {
    const cfg = {
      model,
      field,
      process,
      element: this.#element,
      defer: this.#element instanceof HTMLElement
    }

    if (namespace === 'class') {
      DataBindingRegistry.registerClassNameBinding({
        ...cfg,
        className: attribute
      })
    } else {
      DataBindingRegistry.registerAttributeBinding({
        ...cfg,
        attribute
      })
    }

    const value = field ? model[field] : null
    return process ? process(field ? value : model.data) : value
  }

  #processAttribute = (name, value, namespace) => {
    name = `${namespace ? `${namespace}-` : ''}${name}`

    switch (NGN.typeof(value)) {
      case 'array': return this.#processList(name, value)
      case 'object': return this.#processObject(name, value)
      case 'boolean': return value

      case 'string':
      case 'number': return HTMLParser.escapeString(`${value}`)
    
      default: throw new TypeError(`Invalid attribute "${name}"`)
    }
  }

  #processCfg = cfg => {
    if (!cfg) {
      return {}
    }

    const type = NGN.typeof(cfg)

    if (type !== 'object') {
      throw new TypeError(`bind() attributes configuration: Expected object, received ${type}`)
    }

    const result = {}
    const keys = Object.keys(cfg)

    for (let i = keys.length - 1; i >= 0; i--) {
      const attribute = keys[i]
      let value = this.#processAttribute(attribute, cfg[attribute])

      if (typeof value === 'string') {
        value = value.trim().split(' ')
      }

      result[attribute] = value
    }

    return result
  }

  #processList = (attribute, arr) => {
    const result = []

    for (let i = 0, length = arr.length; i < length; i++) {
      let item = arr[i]
      const type = NGN.typeof(item)

      switch (type) {
        case 'object':
          if (attribute !== 'class') {
            throw new Error(`Invalid bind() configuration: Arrays with nested objects are only supported by the "class" attribute`)
          }

          result.push(...this.#processObject(attribute, item, true))
          continue

        case 'number':
          result.push(`${item}`)
          continue
        
        case 'string':
          result.push(...item.trim().split(' ').map(slug => slug.trim()))
          continue

        default: throw new TypeError(`Attribute binding array expected "string," "number," or "object," received "${type}"`)
      }
    }

    return result
  }

  #processNestedBooleanObject = (attribute, obj) => {
    const keys = Object.keys(obj)
    const result = []

    for (let i = 0, length = keys.length; i < length; i++) {
      const key = keys[i]
      let value = obj[key]

      if (NGN.typeof(value) === 'object' && value.hasOwnProperty('type') && value.type === Constants.INTERPOLATION_DATABINDING) {
        value = this.#bind(key, value, attribute) === true
      }
      
      if (value === true) {
        result.push(key)
      }
    }

    return result
  }

  #processObject = (attribute, obj, nested = false) => {
    if (obj.hasOwnProperty('type') && obj.type === Constants.INTERPOLATION_DATABINDING) {
      return this.#bind(attribute, obj)
    }

    if (nested) {
      return this.#processNestedBooleanObject(attribute, obj)
    }

    const result = {}

    Object.keys(obj).forEach(slug => {
      const value = obj[slug]
      result[slug] = this.#processAttribute(slug, value, attribute)
    })

    return result
  }
}