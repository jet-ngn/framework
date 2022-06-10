import Session from './Session'

export default class PermissionsManager {
  #entity
  #roles

  constructor (entity, roles) {
    this.#entity = entity
    this.#roles = roles
  }

  isAuthorized (...rights) {
    const matchingRights = Object.keys(this.#roles).reduce((result, role) => {
      if (Session.user.roles.includes(role)) {
        result.push(...this.#roles[role])
      }

      return result
    }, [])

    return rights.every(right => matchingRights.includes(right))
  }
}