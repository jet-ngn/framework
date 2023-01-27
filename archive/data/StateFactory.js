import { getStateByProxy, registerState } from './DataRegistry'

/**
 * @class StateFactory
 * Creates new States. This class is exposed to developers as "State." 
 * Usage: 
 * const myState = new State(Array|Object|Set|Map[, String|Number|Array|Object|Set|Map|StateConfigObject[, StateMetadataObject]])
 */
export default class StateFactory {
  constructor (data, config) {
    return registerState(...arguments)
  }
}