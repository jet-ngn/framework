import TrackableRegistry from './TrackableRegistry.js'

export class Trackable {
  constructor (target) {
    return TrackableRegistry.getTarget(target) ?? TrackableRegistry.observe(target)
  }
}