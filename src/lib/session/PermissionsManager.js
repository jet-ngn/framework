export default class PermissionsManager {
  #roles

  constructor (config) {
    this.#roles = config
  }

  isAuthorized (...rights) {
    const matchingRights = Object.keys(this.#roles).reduce((result, role) => ([
      ...result,
      ...(Session.user?.roles.includes(role) ? this.#roles[role] : [])
    ]), [])

    return rights.every(right => matchingRights.includes(right))
  }

  hasRole (...roles) {
    return roles.some(role => Object.keys(this.#roles).includes(role))
  }
}