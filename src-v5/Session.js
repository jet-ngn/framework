// import { EventEmitter } from 'NGN'
import User from './User.js'

class Session {
  #user = null

  get user () {
    return this.#user
  }

  close () {
    this.#user = null
    // this.emit('closed')
  }

  open (userData) {
    if (!!this.#user) {
      throw new Error('There is already an active user')
    }

    this.#user = new User(userData)
    // this.emit('opened', this.#user)
  }
}

export default new Session