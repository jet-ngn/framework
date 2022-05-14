import EventHandler from './EventHandler.js'

export default class DOMEventHandler extends EventHandler {
  constructor (context, event, callback, cfg) {
    if (cfg?.once) {
      cfg.max = 1
      delete cfg.once
    }

    super(...arguments, 'DOMEventHandler')
  }
}