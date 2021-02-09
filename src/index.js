import DataModel from './data/DataModel.js'
import DataStore from './data/DataStore.js'
import Entity from './API/Entity.js'
import Component from './API/Component.js'
import Partial from './API/Partial.js'
import PerformanceMonitor from './diagnostics/PerformanceMonitor.js'
import { css, html, markdown, svg } from './tag/tags.js'
import { domContentLoadedHandler, createId, elementIsVisible } from './Utilities.js'

globalThis.addEventListener('error', evt => {
  return false
})

if (!window.hasOwnProperty('NGN')) {
  throw new Error('Jet requires NGN. See https://github.com/ngnjs/NGN')
}

const { BUS, EventEmitter, Tasks } = NGN

const Diagnostics = {
  PerformanceMonitor
}

const Utilities = {
  createId
}

const DOMUtilities = {
  elementIsVisible
}

export {
  BUS as Bus,
  Component,
  Diagnostics,
  DOMUtilities,
  Entity,
  EventEmitter,
  DataModel,
  Partial,
  DataStore,
  Tasks as Queue,
  Utilities,
  css,
  html,
  markdown,
  svg,
  domContentLoadedHandler as ready
}
