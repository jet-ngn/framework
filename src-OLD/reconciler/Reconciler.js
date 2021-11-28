import Template from '../renderer/Template.js'
import Job from './Job.js'

import PerformanceMonitor from '../diagnostics/PerformanceMonitor.js'

export default class Reconciler {
  #context
  #queue = new NGN.Tasks()
  #jobs = []

  constructor (context) {
    this.#context = context
  }

  get context () {
    return this.#context
  }

  get jobs () {
    return this.#jobs
  }

  get layoutJobs () {
    return this.#jobs.filter(job => job.triggersLayout)
  }

  addJob ({ name, callback, data = {}, triggersLayout = false }) {
    this.#jobs.push(new Job(name, callback, data, triggersLayout))
  }

  clear () {
    this.#jobs = []
    this.#queue = new NGN.Tasks()
  }

  run (cb, cfg = { sync: true }) {
    this.#queue.on('complete', () => {
      // PerformanceMonitor.end('reconcile')
      // PerformanceMonitor.measure()
      cb && cb()
    })

    this.#jobs.forEach(({ name, callback }) => this.#queue.add(name, callback))
    // PerformanceMonitor.start('reconcile')
    this.#queue.run(cfg.sync)
  }

  // addAll: 'addEventListeners',
  // addOne: 'addEventListener',
  // collection: 'listeners',
  // get: 'getEventListener',
  // hasAny: 'hasEventListeners',
  // hasOne: 'hasEventListener',
  // reconcile: this.#reconcileEventListener,
  // remove: 'removeEventListener'

  // reconcileProperties ({
  //   name,
  //   plural,
  //   addAll,
  //   addOne,
  //   collection,
  //   get,
  //   hasAny,
  //   hasOne,
  //   reconcile,
  //   remove
  // }, update) {
  //   if (!this.#context[hasAny]) {
  //     return this.addJob({
  //       name: `Add ${plural}`,
  //       triggersLayout: true,
  //
  //       data: {
  //         current: this.#context[collection],
  //         update: update[collection]
  //       },
  //
  //       callback: next => {
  //         this.#context[addAll](update[collection])
  //         next()
  //       }
  //     })
  //   }
  //
  //   // TODO: Replace with traditional for loop for better efficiency
  //   for (let item in { ...update[collection], ...this.#context[collection] }) {
  //     if (update[hasOne](item)) {
  //       if (this.#context[hasOne](item)) {
  //         reconcile(item, current[get](item), update[get](item))
  //         continue
  //       }
  //
  //       this.addJob({
  //         name: `Add ${name}`,
  //         triggersLayout: true,
  //
  //         data: {
  //           name: item,
  //           value: {
  //             current: this.#context[get](item),
  //             update: update[get](item)
  //           }
  //         },
  //
  //         callback: next => {
  //           this.#context[addOne](item, update[get](item))
  //           next()
  //         }
  //       })
  //
  //       continue
  //     }
  //
  //     this.addJob({
  //       name: `Removing ${name}`,
  //       triggersLayout: true,
  //       data: item,
  //
  //       callback: next => {
  //         this.#context[remove](item)
  //         next()
  //       }
  //     })
  //   }
  // }
}
