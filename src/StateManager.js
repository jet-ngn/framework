import WorkerSubscriber from './WorkerSubscriber'
import { DATA_WORKER } from './env'

export default class StateManager extends WorkerSubscriber {
  #proxy

  constructor (context, model) {
    super(DATA_WORKER, {
      id: context.id,
      model
    }, (action, payload) => {
      console.log('HANDLE', action)
      // switch (action) {
      //   case 'app registered': return this.emit('ready')
      // }
    })

    this.#proxy = new Proxy(model, {
      
    })
  }

  get proxy () {
    return this.#proxy
  }

  destroy () {

  }
}