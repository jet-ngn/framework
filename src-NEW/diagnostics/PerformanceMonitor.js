export default class PerformanceMonitor {
  static #enabled = false
  static #marks = []
  static #measurements = []
  static #showLogs = true

  static #observer = new PerformanceObserver(list => {
    this.#measurements.push(...list.getEntries().map(({ name, startTime, duration }) => ({
      name,
      startTime,
      endTime: startTime + duration,
      duration
    })))
  })

  static clear () {
    this.#marks = []
    this.#measurements = []
    performance.clearMarks()
  }

  static start (name) {
    if (!this.#enabled) {
      this.#enable()
    }

    if (!name) {
      return console.error('start(name: String) requires a name parameter!')
    }

    const id = NGN.DATA.util.GUID()
    this.#marks.push({ id, name })
    performance.mark(`START ${id}`)
  }

  static end (name) {
    if (!name) {
      return console.error('end(name: String) requires a name parameter!')
    }

    const { id } = this.#marks.find(mark => name === mark.name)
    performance.mark(`STOP ${id}`)
  }

  static measure (log = this.#showLogs) {
    const queue = new NGN.Tasks()

    queue.on('complete', () => this.clear())

    queue.add('Measuring', next => {
      this.#marks.forEach(({ name, id }) => performance.measure(name, `START ${id}`, `STOP ${id}`))
      next()
    })

    if (log) {
      queue.add('Logging Measurements', next => {
        setTimeout(() => {
          let total = 0

          this.#measurements.forEach(({ name, duration }) => {
            total += duration
            console.info(`Completed "${name}" in ${duration}ms.`)
          })

          if (this.#measurements.length > 1) {
            console.info(`Total duration: ${total}ms`)
          }

          next()
        }, 0)
      })
    }

    queue.run(true)
  }

  static #disable = () => {
    this.#observer.disconnect()
    this.#enabled = false
  }

  static #enable = () => {
    this.#observer.observe({ entryTypes: ['measure'] })
    this.#enabled = true
  }

  static #throw = method => {
    throw new Error(`PerformanceMonitor is not enabled. Please call enable() before ${method}()`)
  }

  // static get log () {
  //   return this.#measurements
  // }
  //
  // static enable () {
  //   if (this.#enabled) {
  //     throw new Error('PerformanceMonitor is already enabled')
  //   }
  //
  //   this.#observer.observe({ entryTypes: ['measure'] })
  //   this.#enabled = true
  // }
  //
  // disable () {
  //   if (!this.#enabled) {
  //     throw new Error('PerformanceMonitor is already disabled')
  //   }
  //
  //   this.#observer.disconnect()
  //   this.#enabled = false
  // }
  //
  // clear () {
  //   if (!this.#enabled) {
  //     return this.#throw('clear')
  //   }
  //
  //   this.#marks = []
  //   this.#measurements = []
  //   performance.clearMarks()
  // }
  //
  // start (name) {
  //   if (!this.#enabled) {
  //     return this.#throw('start')
  //   }
  //
  //   if (!name) {
  //     return console.error('start(name: String) requires a name parameter!')
  //   }
  //
  //   const id = NGN.DATA.util.GUID()
  //   this.#marks.push({ id, name })
  //   performance.mark(`START ${id}`)
  // }
  //
  // end (name) {
  //   if (!this.#enabled) {
  //     return this.#throw('end')
  //   }
  //
  //   if (!name) {
  //     return console.error('end(name: String) requires a name parameter!')
  //   }
  //
  //   const { id } = this.#marks.find(mark => name === mark.name)
  //   performance.mark(`STOP ${id}`)
  // }
  //
  // measure (log = this.#showLogs) {
  //   if (!this.#enabled) {
  //     return this.#throw('measure')
  //   }
  //
  //   const queue = new NGN.Tasks()
  //
  //   queue.on('complete', () => this.clear())
  //
  //   queue.add('Measuring', next => {
  //     this.#marks.forEach(({ name, id }) => performance.measure(name, `START ${id}`, `STOP ${id}`))
  //     next()
  //   })
  //
  //   if (log) {
  //     queue.add('Logging Measurements', next => {
  //       setTimeout(() => {
  //         let total = 0
  //
  //         this.#measurements.forEach(({ name, duration }) => {
  //           total += duration
  //           console.info(`Completed "${name}" in ${duration}ms.`)
  //         })
  //
  //         if (this.#measurements.length > 1) {
  //           console.info(`Total duration: ${total}ms`)
  //         }
  //
  //         next()
  //       }, 0)
  //     })
  //   }
  //
  //   queue.run(true)
  // }
  //
  // #throw = method => {
  //   throw new Error(`PerformanceMonitor is not enabled. Please call enable() before ${method}()`)
  // }
}
