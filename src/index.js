import NGN from 'NGN'
import App from './App.js'
import { html, svg } from './Tags.js'
import DataModel from './DataModel.js'
import DataStore from './DataStore.js'
import { defineCustomElement } from './CustomElement.js'

const { BUS, EventEmitter, Queue } = NGN

function handleDOMContentLoaded (cb) {
  let handler = function () {
    cb()
    document.removeEventListener('DOMContentLoaded', handler)
  }

  document.addEventListener('DOMContentLoaded', handler)
}

handleDOMContentLoaded(evt => BUS.emit('ready'))

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