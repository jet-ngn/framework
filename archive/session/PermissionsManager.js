import IdentifiedClass from '../lib/IdentifiedClass'
import Session from './Session'

export default class PermissionsManager extends IdentifiedClass {
  #roles

  constructor (roles, idPrefix) {
    super(idPrefix)
    this.#roles = roles ?? null
  }

  allows (...rights) {
    const matchingRights = Object.keys(this.#roles).reduce((result, role) => ([
      ...result,
      ...(Session.user?.roles.includes(role) ? this.#roles[role] : [])
    ]), [])

    return rights.every(right => matchingRights.includes(right))
  }

  isAccessibleTo (...roles) {
    return roles.some(role => Object.keys(this.#roles).includes(role))
  }
}