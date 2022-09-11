import { addHandler, emit } from './events/Bus'
import { processTemplate } from './rendering/Renderer'
import { createID } from '../utilities/IDUtils'

const JetComponent = superclass => class extends superclass {
  #attributes
  // #description
  #name
  // #parent
  // #rootNode
  // #route
  #scope
  #tag
  // #version

  #onMount

  constructor (tag, { attributes, name, on, render, style }) {
    super()

    this.#attributes = attributes ?? {}
    this.#name = name ?? tag
    this.#scope = createID({ prefix: tag })
    this.#tag = tag

    this.attachShadow({ mode: 'open' })
    
    if (render) {
      this.shadowRoot.append(processTemplate(null, render.call(this)))
    }

    Object.keys(on ?? {}).forEach(evt => {
      if (evt !== 'mount') {
        return addHandler(this, evt, on[evt])
      }
      
      this.#onMount = on[evt]
    })
  }

  get name () {
    return this.#name
  }

  get scope () {
    return this.#scope
  }

  attributeChangedCallback (name, previous, current) {
    console.log(...arguments)
  }

  connectedCallback () {
    this.#onMount && this.#onMount.call(this)
  }

  emit (evt, ...args) {
    emit(`${this.#scope}.${evt}`, ...args)
  }
}

export function createComponent (tag, cfg) {
  if (customElements.get(tag)) {
    throw new Error(`Custom Element "${tag}" already exists`)
  }

  const options = {}

  if (cfg.extends) {
    options.extends = cfg.extends
  }

  class Component extends JetComponent(options.extends ? getInterface(options.extends) : HTMLElement) {
    constructor () {
      super(tag, cfg)
    }

    static get observedAttributes () {
      return Object.keys(cfg.attributes ?? {})
    }
  }
  
  customElements.define(tag, Component, options)
}

function getInterface (tag) {
  const { constructor } = document.createElement(tag)
  return constructor
}