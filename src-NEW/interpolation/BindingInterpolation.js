import StyleRegistry from '../registries/StyleRegistry.js'
import DOMEventRegistry from '../registries/DOMEventRegistry.js'
import HTMLParser from '../parser/HTMLParser.js'
import Interpolation from './Interpolation.js'
import Renderer from '../renderer/Renderer.js'

export default class BindingInterpolation extends Interpolation {
  #config
  #template
  #className
  #shadowRoot

  constructor (context, interpolation, index, retainFormatting) {
    super(...arguments)

    this.#config = interpolation.config
    this.#template = interpolation.template
    this.#shadowRoot = interpolation.shadowRoot ?? null
  }

  get type () {
    return 'bind'
  }

  get config () {
    return this.#config
  }

  get template () {
    return this.#template
  }

  set className (className) {
    this.#className = className
  }

  get css () {
    return this.#config.css
  }

  reconcile (update) {
    if (update.config.hasOwnProperty('css')) {
      update.className = this.#className
    }

    update.render(false)
    this.template.reconcile(update.template)
    update.rendered = this.rendered

    if (Object.keys(update.config.on ?? {}).length > 0) {
      update.template.nodes[0].addEventListeners(update.config.on)
    }
  }

  remove () {
    this.#template.nodes[0].remove()
    this.rendered = []
  }

  render (addEventListeners = true) {
    const { nodes } = this.#template

    if (nodes.length > 1) {
      throw new Error('Cannot bind to multiple nodes')
    }

    const element = nodes[0]
    let attributes = this.#processAttributes(element, this.#config.attributes)

    if (this.#config.hasOwnProperty('css')) {
      this.#applyCss(attributes, this.#config.css, element)
    }

    if (Object.keys(attributes).length > 0) {
      this.#applyAttributes(attributes, element)
    }

    if (addEventListeners && Object.keys(this.#config.on ?? {}).length > 0) {
      element.addEventListeners(this.#config.on)
    }

    this.rendered = element.render()

    if (this.#config.hasOwnProperty('entity')) {
      const { entity } = this.#config
      const cfg = {
        manager: this.#template.context,
        element
      }

      if (this.#config.hasOwnProperty('data')) {
        cfg.data = this.#config.data
      }

      entity[entity.initialized ? 'reinitialize' : 'initialize'](cfg)
    }

    return this.rendered
  }

  #applyAttributes = (attributes, element) => {
    const classList = attributes['class']

    if (classList) {
      if (Array.isArray(classList)) {
        element.addClass(...classList)
      } else {
        element.addClass(classList)
      }

      delete attributes['class']
    }

    element.setAttributes(attributes)
  }

  #applyCss = (attributes, css, element) => {
    if (!this.#className) {
      this.#className = `${this.id}_${NGN.DATA.util.GUID()}`
    }

    if (attributes.hasOwnProperty('class')) {
      attributes['class'].push(this.#className)
    } else {
      attributes['class'] = [this.#className]
    }

    if (StyleRegistry.hasRule(this.#className)) {
      StyleRegistry.updateRule(this.#className, css)
    } else {
      StyleRegistry.createRule(this.#className, css)
    }
  }

  #processAttribute = (element, name, value) => {
    const type = NGN.typeof(value)

    switch (type) {
      case 'array': return this.#resolveList(value)

      case 'object':
        if (value.type && value.type === 'data') {
          value.bindAttribute(element, name, element.context instanceof HTMLElement)
          return value.initialValue
        }

        return value

      case 'boolean': return value

      case 'string':
      case 'number': return HTMLParser.escapeString(`${value}`)

      default: throw new TypeError(`Invalid attribute "${name}"`)
    }
  }

  #processAttributes = (element, attributes) => {
    if (!attributes) {
      return {}
    }

    const type = NGN.typeof(attributes)

    if (type !== 'object') {
      throw new TypeError(`bind() attributes configuration: Expected object, received ${type}`)
    }

    return Object.keys(attributes).reduce((result, name) => {
      const value = attributes[name]
      const processed = this.#processAttribute(element, name, value)

      if (NGN.typeof(processed) === 'object') {
        Object.keys(processed).forEach(attribute => {
          const val = processed[attribute]
          result[`${name}-${attribute}`] = this.#processAttribute(element, attribute, typeof val === 'boolean' ? `${val}` : val)
        })
      } else {
        result[name] = processed
      }

      return result
    }, {})
  }

  #resolveList = arr => {
    return arr.reduce((list, item) => {
      if (NGN.typeof(item) === 'object') {
        list.push(...Object.keys(item).filter(key => item[key] === true))
      } else {
        list.push(HTMLParser.escapeString(`${item}`))
      }

      return list
    }, [])
  }
}
