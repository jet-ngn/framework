import { registerState, removeStateByProxy } from './DataRegistry'
import ContentBinding from './bindings/ContentBinding'
import StateHistory from './StateHistory'

export default class State {
  #name
  #description
  #meta
  #model
  #version
  #bindings = []
  #history
  #proxy
  #childProxies = new Set

  constructor (model, meta, proxy) {
    const { name = null, description = null, version = null } = meta ?? {}

    this.#proxy = proxy
    this.#meta = meta ?? null
    this.#model = model
    this.#name = name ?? null
    this.#description = description ?? null
    this.#version = version ?? null
    this.#history = new StateHistory(proxy)
  }

  get bindings () {
    return this.#bindings
  }

  get childProxies () {
    return this.#childProxies
  }

  get description () {
    return this.#description
  }

  get history () {
    return this.#history
  }

  get meta () {
    return this.#meta
  }

  get model () {
    return this.#model
  }

  get name () {
    return this.#name
  }

  get proxy () {
    return this.#proxy
  }

  get version () {
    return this.#version
  }

  addBinding (binding, options) {
    const { mode = 'append', index = -1 } = options ?? {}

    if (binding instanceof ContentBinding) {
      const { parent } = binding
      parent && parent.addChildBinding(binding, options)
    }

    binding.state = this

    switch (mode) {
      case 'prepend': return this.#bindings.unshift(binding)
      case 'append': return this.#bindings.push(binding)
    }
  }

  addChildProxy (proxy) {
    this.#childProxies.add(proxy)
    return proxy
  }

  clearBindings () {
    this.#bindings = []
  }

  getDefaultPropertyValue (property, model) {
    const value = model[property]

    if (Array.isArray(value)) {
      return this.addChildProxy(this.getProxy(...value))
    }

    switch (value) {
      case String:
      case Number:
      case Object:
      case Map:
      case Set: return null
    }

    return value?.default ?? null
  }

  getProxy (initial, config = {}) {
    return registerState(initial, config)
  }

  getRawData (target) {
    return JSON.parse(JSON.stringify(target))
  }

  removeBinding (binding) {
    this.#bindings = this.#bindings.filter(stored => stored !== binding)
  }

  removeBindingsByParent (parent) {
    this.#bindings = this.#bindings.reduce((result, binding) => {
      return binding.parent === parent ? result : [...result, binding]
    }, [])
  }

  removeBindingsByView (view) {
    this.#bindings = this.#bindings.reduce((result, binding) => {
      return binding.view === view ? result : [...result, binding]
    }, [])
  }

  removeChildProxy (proxy) {
    removeStateByProxy(proxy)
    this.#childProxies.delete(proxy)
  }

  removeChildProxies () {
    this.#childProxies.forEach(proxy => this.removeChildProxy(proxy))
  }
}

export function getTarget (target) {
  if (Array.isArray(target)) {
    return [...target]
  }

  if (typeof target === 'object') {
    return { ...target }
  }

  throw new TypeError(`Data States do not currently support "${target.constructor.name}" primitives.`)
}