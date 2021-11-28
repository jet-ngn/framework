import KeyboardManager from './KeyboardManager.js'

export default {
  name: 'Keyboard',

  initialize (context, cfg) {
    const manager = new KeyboardManager(context, cfg.keyboard)
    manager.initialize()
    return manager
  }
}
