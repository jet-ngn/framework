import { registerDataset } from './registries/DatasetRegistry'

export default class Dataset {
  constructor (obj, isGlobal = true) {
    return registerDataset(...arguments)
  }
}