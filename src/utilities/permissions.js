import View from '../lib/rendering/View'
import Session from '../lib/session/Session'
import Unauthorized from '../lib/views/401'
import Forbidden from '../lib/views/403'

export function getPermittedView (view) {
  const { permissions } = view

  if (permissions) {
    const args = { parent: view.parent, element: view.element }

    if (!Session.user) {
      return new View({ ...args, config: Unauthorized })
    }

    if (!view.isAccessibleTo(...Session.user.roles)) {
      return new View({ ...args, config: Forbidden })
    }
    
    // if (!Session.user.hasRole(Object.keys(permissions))) {
    //   return new View({ ...args, config: Forbidden })
    // }
  }

  return view
}