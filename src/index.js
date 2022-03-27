import NGN from 'NGN'
import App from './API/App.js'
import Template from './Template.js'
import DataModel from './data/DataModel.js'
import DataStore from './data/DataStore.js'
import ObservableRegistry from './registries/ObservableRegistry.js'
// import { defineCustomElement } from './API/CustomElement.js'

const { BUS, EventEmitter, Queue } = NGN

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

function html (strings, ...interpolations) {
  return new Template({ type: 'html', strings, interpolations })
}

function svg (strings, ...interpolations) {
  return new Template({ type: 'svg', strings, interpolations })
}

// function css (strings, ...interpolations) {
//   return new Template({ type: 'css', strings, interpolations })
// }

// globalThis.md = md

// BUS.on('*', function () {
//   console.log(this.event);
// })

function observe (target) {
  return ObservableRegistry.getTarget(target) ?? ObservableRegistry.register(target)
}

function track (target, property, transform) {
  return ObservableRegistry.track(...arguments)
}

export {
  App,
  BUS as Bus,
  DataModel,
  DataStore,
  // defineCustomElement,
  EventEmitter,
  Queue,
  html,
  svg,
  // css,
  // md,
  observe,
  track
}