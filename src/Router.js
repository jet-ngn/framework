import Bus from './Bus'

// { path, data, vars, params, etc... }
let previous, current

export default class Router {
  static get current () {
    return current
  }
  
  static get previous () {
    return previous
  }

  static goto (path, data) {
    // TODO: Fire "navigate" event on Bus. Fired "navigated" event after complete
    if (typeof path === 'number') {
      return console.log('GOTO', path)
    }

    console.log('GOTO', path)
  }
}