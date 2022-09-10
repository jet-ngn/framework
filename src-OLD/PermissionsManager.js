import Session from './Session'

export default class PermissionsManager {
  #entity
  #roles

  constructor (entity, roles) {
    this.#entity = entity
    this.#roles = roles ?? []
  }

  isAuthorized (...rights) {
    const matchingRights = Object.keys(this.#roles).reduce((result, role) => ([
      ...result,
      ...(Session.user.roles.includes(role) ? this.#roles[role] : [])
    ]), [])

    return rights.every(right => matchingRights.includes(right))
  }
}