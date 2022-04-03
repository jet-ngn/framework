import { Bus } from '../index.js'
 
export async function onLoad () {
  for (let app in apps) {
    app = apps[app]
    
    if (app.autostart && !app.started) {
      await app.start()
    }
  }

  Bus.emit('loaded')
  document.removeEventListener('DOMContentLoaded', onLoad)
}

document.addEventListener('DOMContentLoaded', onLoad)

const apps = {}

export default class AppRegistry {
  static register (app) {
    apps[app.name] = app
  }
}