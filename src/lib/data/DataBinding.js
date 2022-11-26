import DataBindingInterpolation from './DataBindingInterpolation'
import PermissionsManager from '../session/PermissionsManager'
import { ViewPermissions } from '../../View'

export default class DataBinding extends DataBindingInterpolation {
  #view
  #value = null

  constructor (view, { targets, transform }) {
    super(targets, transform)
    this.#view = view
  }

  get view () {
    return this.#view
  }

  get value () {
    return this.#value
  }

  async reconcile (cb) {
    const previous = this.#value

    let newValue = this.transform(...this.targets.map(target => {
      if (target instanceof ViewPermissions) {
        return new PermissionsManager(target)
      }

      return target
    }))

    newValue = Array.isArray(newValue) ? [...newValue] : newValue

    if (newValue !== this.#value) {
      this.#value = newValue

      cb && await cb({
        previous,
        current: this.#value
      })
    }
  }
}





