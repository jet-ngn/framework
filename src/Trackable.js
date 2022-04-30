import TrackableRegistry from './TrackableRegistry.js'

export class Trackable {
  constructor (target) {
    const existing = TrackableRegistry.getTarget(target)
    return existing?.revocable?.proxy ?? TrackableRegistry.observe(target)
  }
}