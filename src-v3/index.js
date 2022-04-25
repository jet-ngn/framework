import NGN from 'NGN'
import App from './App.js'
import { html, svg } from './Tags.js'
import { getChanges, track, Trackable } from './registries/TrackableRegistry.js'
const { BUS, EventEmitter } = NGN
import { NANOID } from '@ngnjs/libdata'

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
  getChanges,
  NANOID as createId
}