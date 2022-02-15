import NGN from 'NGN'
import DataModel from './DataModel.js'

export default class DataStore extends NGN.EventEmitter {
  #model

  constructor (model) {
    this.#model = model
  }

  load (data) {
    console.log('LOAD DATA STORE')
  }


}