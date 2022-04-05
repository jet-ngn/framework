import NGN from 'NGN'
import App from './App.js'
import { html, svg } from './Tags.js'
import { getChanges, track, Trackable } from './registries/TrackableRegistry.js'
const { BUS, EventEmitter } = NGN

window.addEventListener('popstate', evt => {
  console.log(evt);
  // if (!evt.state) {
  //   return
  // }

  // let { hash, map, name, payload, query } = evt.state

  // if (this.has(name)) {
  //   return this.#execChange(this.getState(name), payload, { hash, map, query })
  // }

  // TODO: Throw Error
})

// BUS.on('*', function () {
//   console.log(this.event);
// })

export {
  App,
  BUS as Bus,
  EventEmitter,
  html,
  svg,
  // css,
  // md,
  Trackable,
  track,
  getChanges
}