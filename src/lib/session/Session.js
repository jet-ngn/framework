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

  async close () {
    this.#user = null
    await InternalBus.emit('session.closed')
  }

  async open (userData) {
    if (!!this.#user) {
      throw new Error('There is already an active user')
    }

    this.#user = new User(userData)
    await InternalBus.emit('session.opened', this.#user)
  }
}

export default new Session(location.pathname)