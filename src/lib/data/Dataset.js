import { registerDataset } from './DatasetRegistry'

export default class Dataset {
  constructor (obj, isGlobal = true) {
    return registerDataset(...arguments)
  }
}