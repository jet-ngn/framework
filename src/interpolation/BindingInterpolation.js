import Constants from '../Constants.js'

import StyleRegistry from '../registries/StyleRegistry.js'
// import DOMEventRegistry from '../registries/DOMEventRegistry.js'
// import HTMLParser from '../parser/HTMLParser.js'
import Interpolation from './Interpolation.js'
// import Renderer from '../renderer/Renderer.js'
import AttributeBinding from '../data/AttributeBinding.js'

export default class BindingInterpolation extends Interpolation {
  #config
  #template
  #className
  #shadowRoot

  constructor (context, interpolation, retainFormatting) {
    super(...arguments)

    this.#config = interpolation.config
    this.#template = interpolation.template
    this.#shadowRoot = interpolation.shadowRoot ?? null
  }

  get type () {
    return Constants.INTERPOLATION_BINDING
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
    
    this.#applyAttributes(element, this.#config.attributes)
    
    if (addEventListeners && Object.keys(this.#config.on ?? {}).length > 0) {
      element.addEventListeners(this.#config.on)
    }

    this.rendered = element.render()

    if (this.#config.hasOwnProperty('entity')) {
      this.#bindEntity(element)
    } else if (element.isComponent) {
      this.#bindComponent(element)
    }

    return this.rendered
  }

  #applyAttributes = element => {
    let attributeBindings = new AttributeBinding(element, this.#config.attributes)

    if (this.#config.hasOwnProperty('css')) {
      this.#applyCss(attributeBindings, this.#config.css, element)
    }

    if (attributeBindings.hasAttributes) {
      this.#applyAttributeBindings(element, attributeBindings)
    }
  }

  #applyAttributeBindings = (element, { processed }) => {
    const classes = processed['class']

    if (classes) {
      if (Array.isArray(classes)) {
        element.addClass(...classes)
      } else {
        console.log(element);
        element.addClass(classes)
      }

      delete processed['class']
    }

    element.setAttributes(processed)
  }

  #applyCss = (attributeBindings, css, element) => {
    if (!this.#className) {
      this.#className = `${this.id}_${NGN.DATA.util.GUID()}`
    }

    attributeBindings.addClass(this.#className)

    if (StyleRegistry.hasRule(this.#className)) {
      StyleRegistry.updateRule(this.#className, css)
    } else {
      StyleRegistry.createRule(this.#className, css)
    }
  }

  #bindComponent = element => {
    if (this.#config.hasOwnProperty('data')) {
      element.bindData(this.#config.data)
    }
  }

  #bindEntity = element => {
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
}
