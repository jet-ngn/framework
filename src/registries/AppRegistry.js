import { Bus } from '../index.js'
 
export function onLoad () {
  for (let app in apps) {
    app = apps[app]
    
    if (app.autostart && !app.started) {
      app.start()
    }
  }

  Bus.emit('ready')
  document.removeEventListener('DOMContentLoaded', onLoad)
}

document.addEventListener('DOMContentLoaded', onLoad)

const apps = {}

export default class AppRegistry {
  static register (app) {
    apps[app.name] = app
  }
}