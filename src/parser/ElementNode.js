import HTMLParser from './HTMLParser.js'
import ParsedNode from './ParsedNode.js'
import ElementReconciler from '../reconciler/ElementReconciler.js'
import ComponentRegistry from '../registries/ComponentRegistry.js'
import DOMEventRegistry from '../registries/DOMEventRegistry.js'

export default class ElementNode extends ParsedNode {
  #id = NGN.DATA.util.GUID()
  #nodes = []
  #reconciler

  constructor (source, context, interpolationManager) {
    let ref

    if (source.hasAttribute('ref')) {
      ref = source.getAttribute('ref')
      source.removeAttribute('ref')
    }

    super(source, context)

    this.#nodes = HTMLParser.createNodes([...source.childNodes], context, {
      retainFormatting: source.tagName === 'PRE',
      interpolationManager
    })

    if (ref) {
      this.ref = ref
      context.addReference(ref, this)
    }

    if (this.isComponent) {
      const handler = evt => {
        this.source.initialize(this.context)
        this.source.removeEventListener('connected', handler)
      }

      this.source.addEventListener('connected', handler)
    }
  }

  get attributes () {
    return [...this.source.attributes].reduce((result, attr) => {
      result[attr.name] = attr.value === '' ? true : attr.value
      return result
    }, {})
  }

  get classList () {
    return this.source.classList
  }

  get eventListeners () {
    return DOMEventRegistry.getAllElementHandlers(this)
  }

  get hasAttributes () {
    return this.source.attributes.length > 0
  }

  get hasChildren () {
    return this.#nodes.length > 0
  }

  get id () {
    return this.#id
  }

  get isComponent () {
    return ComponentRegistry.has(this.tag.toLowerCase())
  }

  get isCustomElement () {
    return this.tag.includes('-')
  }

  get nodes () {
    return this.#nodes
  }

  get tag () {
    return this.source.nodeName
  }

  get type () {
    return 'element'
  }

  addClass (...classNames) {
    this.source.classList.add(...classNames)
  }

  addEventListener (evt, callback) {
    if (this.context instanceof HTMLElement) {
      // For Custom Elements
      return this.context.addChildEventListener(this, ...arguments)
    }

    DOMEventRegistry.register(this.context, this, evt, callback, {})
  }

  addEventListeners (events) {
    Object.keys(events).forEach(evt => {
      this.addEventListener(evt, events[evt])
    })
  }

  contains (element) {
    return this.source.contains(element)
  }

  getEventListeners (evt) {

  }

  hasEventListener (evt) {
    return DOMEventRegistry.elementHasHandlersByEvent(this, evt)
  }

  hasEventListeners () {
    return DOMEventRegistry.elementHasHandlers(this)
  }

  removeAllEventListeners () {
    console.log('REMOVE EM');
  }

  removeEventListener (evt, handler) {
    DOMEventRegistry.deregister(this, evt, handler)
  }

  removeClass (...className) {
    this.source.classList.remove(...className)
  }

  remove () {
    DOMEventRegistry.removeElement(this)
    super.remove()
  }

  replaceWith () {
    DOMEventRegistry.removeElement(this)
    super.replaceWith(...arguments)
  }

  toggleClass (...className) {
    this.source.classList.toggle(...className)
  }

  getAttribute (attr) {
    return this.source.getAttribute(attr)
  }

  hasAttribute (attr) {
    return !!this.source.attributes.getNamedItem(attr)
  }

  reconcile (update) {
    if (this.isCustomElement) {
      update.source = this.source
      return
    }

    if (!this.#reconciler) {
      this.#reconciler = new ElementReconciler(this)
    }

    this.#reconciler.reconcile(update)
  }

  removeAttribute (attr) {
    this.source.removeAttribute(attr)
  }

  removeAllAttributes () {
    const { attributes } = this.source

    while(attributes.length > 0) {
      this.removeAttribute(attributes[0].name)
    }
  }

  render () {
    const fragment = document.createDocumentFragment()

    for (let i = 0, length = this.#nodes.length; i < length; i++) {
      fragment.append(this.#nodes[i].render())
    }

    this.source.append(fragment)
    return this.source
  }

  setAttribute (name, value) {
    if (!name.startsWith('data-') && typeof value === 'boolean') {
      return value ? this.source.setAttribute(name, '') : this.source.removeAttribute(name)
    }

    this.source.setAttribute(name, HTMLParser.escapeString(value))
  }

  setAttributes (attributes) {
    Object.keys(attributes).forEach(name => {
      this.#setAttribute(name, attributes[name])
    })
  }

  #setAttribute = (name, value) => {
    switch (NGN.typeof(value)) {
      case 'object': return this.#setAttributeObject(name, value)
      default: return this.setAttribute(name, this.#processAttributeValue(value))
    }
  }

  #setAttributeObject = (name, obj) => {
    Object.keys(obj).forEach(slug => {
      this.#setAttribute(`${name}-${slug}`, obj[slug])
    })
  }

  #processAttributeValue = value => {
    switch (NGN.typeof(value)) {
      case 'array': return value.join(' ')
      default: return value
    }
  }
}
