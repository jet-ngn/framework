import { registerDataStore } from './registries/DataStoreRegistry'

export default class DataStore {
  constructor (obj) {
    return registerDataStore(obj)
  }
}