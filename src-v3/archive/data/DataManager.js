import DataCollection from './DataCollection.js'

export function attachDataManager (target, cfg) {
  if (typeof cfg !== 'object') {
    throw new TypeError(`Invalid ${target.constructor.name} "data" configuration. Expected "object", received "${typeof cfg}"`)
  }

  let data = new DataCollection(target, cfg)

  Object.defineProperty(target, 'data', {
    get: () => data
  })
}

