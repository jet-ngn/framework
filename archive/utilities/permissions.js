import View from '../View'
import Session from '../session/Session'
import Unauthorized from '../views/401'
import Forbidden from '../views/403'

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
  }

  return view
}