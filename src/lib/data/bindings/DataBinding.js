import DataBindingInterpolation from '../DataBindingInterpolation'
import Router from '../../routing/Router'
import PermissionsManager from '../../session/PermissionsManager'
import { ViewPermissions } from '../../rendering/View'

export default class DataBinding extends DataBindingInterpolation {
  #app
  #view
  #value = null

  constructor (app, view, { targets, transform }) {
    super(targets, transform)
    this.#app = app
    this.#view = view
  }

  get app () {
    return this.#app
  }

  get view () {
    return this.#view
  }

  get value () {
    return this.#value
  }

  reconcile (cb) {
    const previous = this.#value

    let newValue = this.transform(...this.targets.map(target => {
      if (target instanceof ViewPermissions) {
        return new PermissionsManager(target)
      }

      if (target === Router) {
        console.log('ROUTER')
        return {}
      }

      return target
    }))

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





