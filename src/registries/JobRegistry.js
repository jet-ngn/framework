class JobRegistry {
  #jobs = []

  get hasUnfinishedJobs () {
    return this.#jobs.length > 0
  }

  addJob ({ name, callback }) {
    this.#jobs.push({ name, callback })
  }

  clear () {
    this.#jobs = []
  }

  runJobs () {
    if (!this.hasUnfinishedJobs) {
      return
    }

    const queue = new NGN.Tasks()
    this.#jobs.forEach(({ name, callback }) => queue.add(name, callback))

    queue.on('complete', () => this.clear())
    queue.run()
  }
}

export default new JobRegistry()