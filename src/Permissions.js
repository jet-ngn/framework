// import IAM from '@author.io/iam'
import IdentifiedClass from './IdentifiedClass'

const resources = {}
const roles = {}

class Role {
  #name
  #resources

  constructor (name, resources) {
    this.#name = name
    this.#resources = resources
  }

  assignRights (resource, roles) {

  }
}

class Resource extends IdentifiedClass {
  #name
  #rights
  #roles

  constructor (name, { roles, rights }) {
    super('resource')
    this.#name = name
    this.#rights = rights
    this.#roles = roles
    // this.#rights = rights.map(right => new Right(this, right))
  }
}

export default class Permissions {
  static addView ({ scope }, permissions) {
    resources[scope] = new Resource(scope, permissions)

    // const resource = new Resource(scope, permissions)
    
    // Object.keys(permissions.roles ?? {}).forEach(role => {
    //   const existing = roles[role]

    //   if (existing) {
    //     return existing.assignRights()
    //   }

    //   roles[role] = new Role(role, {
    //     [scope]: permissions.roles[role]
    //   })
    // })

    // Object.keys(config.roles).forEach(role => {
    //   const existing = roles[role]

    //   if (!existing) {
    //     roles[role] = new Role(role, {
    //       [scope]: config.roles[role]
    //     })
    //   }

    //   existing.assignRights(scope, ...config.roles[role])
    // })

    // const resource = IAM.createResource(scope, rights)

    // Object.keys(roles).forEach(role => {
    //   const existing = IAM.roles.find(({ name }) => name === role)

    //   if (!existing) {
    //     return IAM.createRole(role, {
    //       [scope]: roles[role]
    //     })
    //   }

    //   existing.assignRights(scope, ...roles[role])
    // })

    // resources.set(arguments[0], resource)
  }

  static userIsAuthorized (user, entity, right) {
    const resource = resources.get(entity)
    console.log(resource);

    if (!right) {
      return resource.rights.some(({ name }) => user.authorized(resource.name, name))
    }

    return user.authorized(resource.name, right)
  }
}