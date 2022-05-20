import { registerDataSet } from './registries/DataSetRegistry'

export default class DataSet {
  constructor (obj) {
    return registerDataSet(obj)
  }
}