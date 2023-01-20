import DataBindingInterpolation from '../DataBindingInterpolation'
import PermissionsManager from '../../session/PermissionsManager'
import { ViewPermissions } from '../../rendering/View'

export default class DataBinding extends DataBindingInterpolation {
  #app
  #view
  #value = null
  #callback

  constructor (app, view, interpolation) {
    super(interpolation)
    this.#app = app
    this.#view = view
    this.#callback = interpolation.callback ?? null
  }

  get app () {
    return this.#app
  }

  get callback () {
    return this.#callback
  }

  get value () {
    return this.#value
  }

  get view () {
    return this.#view
  }

  reconcile (init = false) {
    const previous = this.#value
    let args = []

    if (this.proxies.size === 1) {
      const [proxy, properties] = [...this.proxies][0]
      
      if (properties.length === 0) {
        args.push(proxy)
      } else {
        args.push(...properties.map(property => proxy[property]))
      }
    } else {
      for (const [proxy, properties] of this.proxies) {
        if (proxy instanceof ViewPermissions) {
          args.push(new PermissionsManager(proxy))
        } else if (properties.length === 0) {
          args.push(proxy)
        // } else if (properties.length === 1) {
        //   args.push(proxy[properties[0]])
        } else {
          args.push(properties.reduce((result, property) => ({ ...result, [property]: proxy[property] }), {}))
        }
      }
    }

    let result = this.transform(...args)
    result = Array.isArray(result) ? [...result] : result

    if (init || result !== previous) {
      this.#value = result ?? null
    }

    return {
      previous,
      current: this.#value
    }
  }
}