import { load, registerState, removeStateByProxy } from '../DataRegistry'
import StateHistory from '../StateHistory'

export default class State {
  #name
  #description
  #version
  #bindings = []
  #history
  #proxy
  #childProxies = new Set

  constructor (proxy, { name, description, version, model, states } = {}) {
    this.#proxy = proxy
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

  get name () {
    return this.#name
  }

  get proxy () {
    return this.#proxy
  }

  get version () {
    return this.#version
  }

  addBinding (binding) {
    this.#bindings.push(binding)
  }

  addChildProxy (proxy) {
    this.#childProxies.add(proxy)
  }

  clearBindings () {
    this.#bindings = []
  }

  removeBindingsByView (view) {
    this.#bindings = this.#bindings.reduce((result, binding) => {
      return binding.view === view ? result : [...result, binding]
    }, [])
  }

  removeChildProxies () {
    this.#childProxies.forEach(proxy => {
      removeStateByProxy(proxy)
      this.#childProxies.delete(proxy)
    })
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