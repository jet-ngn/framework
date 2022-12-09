import IAM from '@author.io/iam'

export default {
  name: 'IAM',

  install ({}, Plugins) {
    Plugins.IAM = class {
      static addView (name, { rights, roles }) {
        IAM.createResource(name, rights)

        Object.keys(roles).forEach(role => {
          const existing = IAM.roles.find(({ name }) => name === role)

          if (!existing) {
            return IAM.createRole(role, {
              [name]: roles[role]
            })
          }

          existing.assignRights(name, ...roles[role])
        })
      }
    }
  }
}