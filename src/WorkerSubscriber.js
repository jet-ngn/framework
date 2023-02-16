import EventEmitter from './EventEmitter'

export default class WorkerSubscriber extends EventEmitter {
  constructor (worker, payload, notify) {
    super()

    worker.subscribe(this, (action, payload) => {
      switch (action) {
        case 'registered': return this.emit('ready')
        default: return notify(action, payload)
      }
    })

    worker.post('register', payload)
  }
}