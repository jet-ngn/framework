import DataCollection from './DataCollection.js'

export default class DataManager {
  #context
  #cfg
  #data

  constructor (context, cfg) {
    this.#context = context
    this.#cfg = cfg
    this.#data = new DataCollection(context, cfg ?? {})
  }

  get data () {
    return this.#data
  }

  attach (data) {
    this.#data.attach(...arguments)
  }

  clearAttachments () {
    this.#data.clearAttachments()
  }
}