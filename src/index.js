// import Assets from './API/Assets.js'
import App from './API/App.js'
import Bus from './API/Bus.js'
import CustomElement from './API/custom-element/CustomElement.js'
import DataModel from './data/DataModel.js'
import DataStore from './data/DataStore.js'
import Entity from './API/Entity.js'
import Partial from './API/Partial.js'
// import PerformanceMonitor from './diagnostics/PerformanceMonitor.js'
import { css, html, markdown, svg } from './tag/tags.js'
import { handleDOMContentLoaded, createID, elementIsVisible } from './Utilities.js'

globalThis.addEventListener('error', evt => {
  return false
})

if (!window.hasOwnProperty('NGN')) {
  throw new Error('Jet requires NGN. See https://github.com/ngnjs/NGN')
}

const { EventEmitter, Tasks } = NGN

const Diagnostics = {
  // PerformanceMonitor

  logEvents: function () {
    Bus.on('*', function () {
      console.log(this.event)
    })
  }
}

const Utilities = {
  createID,
  elementIsVisible
}

handleDOMContentLoaded(() => Bus.emit('ready'))

export {
  // Assets,
  App,
  Bus,
  CustomElement,
  Diagnostics,
  Entity,
  EventEmitter,
  DataModel,
  DataStore,
  Partial,
  Tasks as Queue,
  Utilities,
  css,
  html,
  markdown,
  svg
}
