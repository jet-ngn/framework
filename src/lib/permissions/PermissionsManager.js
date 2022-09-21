import Session from '../session/Session'

export default class PermissionsManager {
  #view
  #roles

  constructor (view, roles = {}) {
    this.#view = view
    this.#roles = roles
  }

  hasRight (...rights) {
    const matchingRights = Object.keys(this.#roles).reduce((result, role) => ([
      ...result,
      ...(Session.user.roles.includes(role) ? this.#roles[role] : [])
    ]), [])

    return rights.every(right => matchingRights.includes(right))
  }

  hasRole (...roles) {
    return roles.some(role => Object.keys(this.#roles).includes(role))
  }
}