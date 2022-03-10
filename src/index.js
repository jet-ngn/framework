import NGN from 'NGN'
import App from './API/App.js'
import { html, svg } from './renderer/Tags.js'
import DataModel from './data/DataModel.js'
import DataStore from './data/DataStore.js'
import { defineCustomElement } from './API/CustomElement.js'

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

const handleDOMContentLoaded = function () {
  BUS.emit('ready')
  document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
}

document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)

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