import Constants from '../Constants.js'
import NodeManager from './NodeManager.js'
import { createId } from '../Utilities.js'

class PartialInstance {
  #context
  #id = createId()
  #name

  constructor (context, cfg) {
    this.#context = context
    this.#name = cfg.name ?? this.#id
  }

  get id () {
    return this.#id
  }

  get name () {
    return this.#name
  }

  get namespace () {
    return this.#context.namespace
  }

  get type () {
    return 'partial'
  }

  bind (cfg, render) {
    if (cfg.hasOwnProperty('entity')) {
      throw new Error(`Partial "${this.name}": Invalid configuration. Partials cannot bind to Entities, only Components`)
    }

    return NodeManager.bind(this, ...arguments)
  }

  emit (evt, ...rest) {
    evt = `${this.namespace}.${this.name}.${arguments[0]}`
    NGN.BUS.emit(evt, this, ...rest)
  }

  fetch (path, fallback = '') {
    return { type: Constants.INTERPOLATION_FETCH, path, fallback }
  }

  mapToHTML (arr, render) {
    return InterpolationManager.mapToHTML(...arguments, this.context.retainFormatting)
  }
}

export default function Partial (cfg) {
  if (!cfg.render) {
    throw new Error('Partial requires a render() function')
  }

  return {
    render: (...args) => ({
      type: Constants.INTERPOLATION_PARTIAL,
      config: cfg,
      constructor: PartialInstance,
      renderFn () {
        this.emit(`render`)
        const rendered = cfg.render.call(this, ...args)
        return rendered
      }
    })
  }
}
