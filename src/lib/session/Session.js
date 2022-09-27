import InternalBus from '../events/InternalBus'
import IdentifiedClass from '../IdentifiedClass'
import User from './User.js'

class Session extends IdentifiedClass {
  #user = null
  #initialRoute

  constructor (initialRoute) {
    super()
    this.#initialRoute = initialRoute
  }

  get initialRoute () {
    return this.#initialRoute
  }

  get user () {
    return this.#user
  }

  close () {
    this.#user = null
    InternalBus.emit('session.closed')
  }

  open (userData) {
    if (!!this.#user) {
      throw new Error('There is already an active user')
    }

    this.#user = new User(userData)
    InternalBus.emit('session.opened', this.#user)
  }
}

export default new Session(location.pathname)