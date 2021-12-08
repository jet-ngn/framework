import Constants from '../Constants.js'
import Entity from '../API/Entity.js'

import StyleRegistry from '../registries/StyleRegistry.js'
// import DOMEventRegistry from '../registries/DOMEventRegistry.js'
// import HTMLParser from '../parser/HTMLParser.js'
import Interpolation from './Interpolation.js'
// import Renderer from '../renderer/Renderer.js'
import AttributeBinding from '../data/AttributeBinding.js'

// export default class BindingInterpolation extends Interpolation {
//   #config
//   #template
//   #entity
//   #attributes
//   #properties
//   #on
//   #css
//   #className = null

//   constructor (context, interpolation, retainFormatting) {
//     super(...arguments)

//     this.#config = interpolation.config
//     this.#template = interpolation.template
//     // this.#entity = this.#config.entity ?? null
//     // this.#attributes = this.#config.attributes ?? null
//     // this.#properties = this.#config.properties ?? null
//     // this.#on = this.#config.on ?? null
//     // this.#css = this.#config.css ?? null
//   }

//   get type () {
//     return Constants.INTERPOLATION_BINDING
//   }

//   get config () {
//     return this.#config
//   }

//   get template () {
//     return this.#template
//   }

//   render () {
//     this.#render(this.#template.nodes, this.#config)
//   }

//   #render = (nodes, { attributes, css }) => {
//     if (nodes.length > 1) {
//       throw new Error('Cannot bind to multiple nodes')
//     }

//     const element = nodes[0]
//     const attributeBinding = new AttributeBinding(element, attributes)

//     // if (css) {
//     //   this.#applyCss(attributeBindings, css, element)
//     // }
//   }
// }

export default class BindingInterpolation extends Interpolation {
  #config
  #template
  #className
  // #shadowRoot

  constructor (context, interpolation, retainFormatting) {
    super(...arguments)

    this.#config = interpolation.config
    this.#template = interpolation.template
    // this.#shadowRoot = interpolation.shadowRoot ?? null
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
    if (update.template.nodes.length > 1) {
      throw new Error('Cannot bind to more than one node')
    }

    // if (update.config.hasOwnProperty('css')) {
    //   update.className = this.#className
    // }

    const { attributes, css, on, properties } = update.config

    this.#removeAttributes()

    // TODO: Rather than removing and replacing listeners, try reconciling them
    this.#removeEventListeners()

    this.#template = this.#template.reconcile(update.template)
    const element = this.#template.nodes[0]

    this.#applyAttributes(element, attributes, css)

    if (Object.keys(on ?? {}).length > 0) {
      element.addEventListeners(on)
    }

    update.rendered = this.rendered

    if (Object.keys(properties ?? {}).length > 0) {
      this.#applyProperties(this.rendered, properties)
    }
  }

  remove () {
    this.#template.nodes[0].remove()
    this.rendered = []
  }

  render () {
    const { nodes } = this.#template

    if (nodes.length > 1) {
      throw new Error('Cannot bind to more than one node')
    }

    const element = nodes[0]
    const { attributes, css, properties, on, entity } = this.#config

    this.#applyAttributes(element, attributes, css)
    
    if (Object.keys(on ?? {}).length > 0) {
      element.addEventListeners(on)
    }

    this.rendered = element.render()
    this.#applyProperties(this.rendered, properties)

    if (!!entity) {
      this.#bindEntity(element)
    } else if (element.isCustom) {
      this.#bindCustomElement(element)
    }
    
    return this.rendered
  }

  #applyAttributes = (element, attributes, css) => {
    let attributeBindings = new AttributeBinding(element, attributes)

    if (css) {
      this.#applyCss(attributeBindings, css, element)
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

  #applyProperties = (element, properties) => {
    if (!properties) {
      return
    }

    Object.keys(properties).forEach(property => {
      const value = properties[property]
  
      if (value === element[property]) {
        return
      }

      element[property] = value
    })
  }

  #bindCustomElement = element => {
    if (this.#config.hasOwnProperty('data')) {
      element.bindData(this.#config.data)
    }
  }

  #bindEntity = element => {
    let { entity } = this.#config
    
    const cfg = {
      manager: this.#template.context,
      element
    }

    if (this.#config.hasOwnProperty('data')) {
      cfg.data = this.#config.data
    }

    entity = entity instanceof Entity ? entity : new Entity(entity)
    entity[entity.initialized ? 'reinitialize' : 'initialize'](cfg)
  }

  #removeAttributes = () => Object.keys(this.#config.attributes ?? {}).forEach(attribute => {
    this.template.nodes[0].removeAttribute(attribute)
  })

  #removeEventListeners = () => Object.keys(this.#config.on ?? {}).forEach(evt => {
    this.template.nodes[0].removeEventListener(evt, this.#config.on[evt])
  })
}
