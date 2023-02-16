export default class WorkerObserver {
  subscribers = new Map

  constructor (worker) {
    this.worker = worker

    worker.addEventListener('message', ({ data }) => {
      this.subscribers.forEach(handler => handler(data.action, data.payload))
    })
  }

  post (action, payload) {
    this.worker.postMessage({ action, payload })
  }

  subscribe (subscriber, handler) {
    this.subscribers.set(subscriber, handler)
  }
}