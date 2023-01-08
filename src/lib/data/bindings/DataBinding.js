import IdentifiedClass from '../../IdentifiedClass'
import PermissionsManager from '../../session/PermissionsManager'
import { ViewPermissions } from '../../rendering/View'

export default class DataBinding extends IdentifiedClass {
  #app
  #view
  #value = null

  #proxies
  #transform

  constructor (app, view, { proxies, transform }) {
    super('data-binding')
    this.#app = app
    this.#view = view
    this.#proxies = proxies
    this.#transform = transform
  }

  get app () {
    return this.#app
  }

  get proxies () {
    return this.#proxies
  }

  get transform () {
    return this.#transform
  }

  get value () {
    return this.#value
  }

  get view () {
    return this.#view
  }

  reconcile (cb) {
    const previous = this.#value

    let args = []

    for (const [proxy, properties] of this.#proxies) {
      if (target instanceof ViewPermissions) {
        args.push(new PermissionsManager(target))
      } else if (properties.length === 0) {
        args.push(proxy)
      } else {
        args.push(properties.reduce((result, property) => ({ ...result, [property]: proxy[property] }), {}))
      }
    }

    let newValue = this.#transform(...args)
    newValue = Array.isArray(newValue) ? [...newValue] : newValue

    if (newValue !== this.#value) {
      this.#value = newValue ?? null

      cb && cb({
        previous,
        current: this.#value
      })
    }
  }
}