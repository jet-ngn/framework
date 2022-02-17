import NGN from 'NGN'
import App from './App.js'
import { html, svg } from './Tags.js'
import DataModel from './DataModel.js'
import DataStore from './DataStore.js'
import { defineCustomElement } from './CustomElement.js'
import EntityRegistry from './EntityRegistry.js'

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

document.addEventListener('DOMContentLoaded', evt => BUS.emit('ready'))

export {
  App,
  BUS as Bus,
  DataModel,
  DataStore,
  defineCustomElement,
  EventEmitter,
  html,
  svg,
  Queue
}