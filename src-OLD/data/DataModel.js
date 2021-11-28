import Constants from '../Constants.js'

export default class DataModel extends NgnDataModel {
  bind (field, process) {
    if (!this.hasOwnProperty(field)) {
      throw new ReferenceError(`Data field "${field}" not found`)
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
