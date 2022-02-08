import { UUID } from 'NGN/libdata'

export default function Driver (superclass = Object) {
  return class Driver extends superclass {
    #id = UUID()
    #dataManager
    #eventManager
    #referenceManager
    #stateManager

    constructor (cfg) {
      super()
    }

    // get data () {
    //   return this.#dataManager
    // }

    // get events () {
    //   return this.#eventManager
    // }

    get id () {
      return this.#id
    }

    // get states () {
    //   return this.#stateManager
    // }

    initialize () {
      console.log('INIT DRIVER')
    }
  }
}