import Constants from '../Constants.js'

export default class DataModel extends NgnDataModel {
  bind (field, process) {
    if (typeof field === 'function') {
      process = field
      field = null
    }

    return {
      type: Constants.INTERPOLATION_DATABINDING,
      model: this,
      field,
      process: process ?? null
    }
  }

  toJSON () {
    return this.representation
  }
}
