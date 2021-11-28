import CommonMapping from './CommonMapping.js'

export default class KeyCommand {
  #context
  #name
  #handler
  #keys
  #os
  #hold
  #preventDefault
  #executions = 0

  #shiftKey = false
  #ctrlKey = false
  #altKey = false
  #metaKey = false

  constructor (context, os, name, { keys, handler, hold, preventDefault }) {
    this.#context = context
    this.#name = name
    this.#os = os
    this.#hold = hold ?? false
    this.#preventDefault = preventDefault ?? false

    if (!keys) {
      throw new Error('KeyCommand requires a "keys" attribute')
    }

    if (Array.isArray(keys)) {
      this.#keys = this.#getKeyCodes(keys)
    } else if (NGN.typeof(keys) !== 'object') {
      throw new TypeError(`KeyCommand "keys" attribute expected object or array, received ${NGN.typeof(keys)}`)
    } else {
      this.#keys = this.#getKeyCodes(keys[this.#os]) ?? null
    }

    if (!this.#keys) {
      return console.error(`KeyCommand "${this.#name}": Unsupported platform "${window.navigator.platform}"`)
    }

    if (NGN.isFn(handler)) {
      this.#handler = () => handler.call(context)
      return
    }

    if (NGN.typeof(handler !== 'string')) {
      throw new TypeError(`KeyCommand expected function or string, received ${NGN.typeof(handler)}`)
    }

    this.#handler = () => this.#context.emit(handler)
  }

  get executions () {
    return this.#executions
  }

  get handler () {
    return this.#handler
  }

  get hold () {
    return this.#hold
  }

  get keys () {
    return this.#keys
  }

  get name () {
    return this.#name
  }

  get shiftKey () {
    return this.#keys.includes('Shift')
  }

  get controlKey () {
    return this.#keys.includes('Control')
  }

  get altKey () {
    return this.#keys.includes('Alt')
  }

  get metaKey () {
    return this.#keys.includes('Meta')
  }

  execute () {
    this.#executions++
    this.#handler()
  }

  #getKeyCodes = keys => keys.map(key => {
    key = CommonMapping[key.toLowerCase()]

    if (!key) {
      throw new Error(`Unrecognized key "${key}"`)
    }

    if (key === 'Command') {
      key = 'Meta'
    }

    return key
  })
}
