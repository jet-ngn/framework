import KeyCommandManager from './KeyCommandManager.js'
import QWERTY from './layouts/QWERTY.js'

export default class KeyboardManager {
  #context
  #os
  #layout
  #initialized = false
  #commandManager

  constructor (context, cfg) {
    this.#context = context
    this.#layout = cfg.layout ?? QWERTY
    this.#os = this.#getOS()

    if (cfg.hasOwnProperty('commands')) {
      this.#commandManager = new KeyCommandManager(context, this.#os, this.#layout, cfg.commands, cfg.disableDefaultCommands ?? false)
    }
  }

  get commands () {
    return this.#commandManager.commands
  }

  initialize () {
    if (this.#commandManager) {
      this.#commandManager.initialize()
    }
  }

  #getOS = () => {
    const platform = window.navigator.platform.toLowerCase()

    return ['mac', 'windows', 'linux'].reduce((os, id) => {
      if (platform.includes(id)) {
        os = id
      }

      return os
    }, 'default')
  }
}
