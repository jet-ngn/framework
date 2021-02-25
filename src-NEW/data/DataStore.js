export default class DataStore extends NGN.EventEmitter {
  #store
  #suppressEvents = false

  constructor (model) {
    super()

    this.#store = new NGN.DATA.Store({
      model: NGN.DATA.Model(model)
    })

    // const self = this
    //
    // this.#store.on('*', function () {
    //   self.emit(this.event, ...arguments)
    // })
  }

  get data () {
    return this.#store.data
  }

  get first () {
    return this.#store.first?.data ?? null
  }

  // get history () {
  //   return this.#store.history ?? []
  // }

  get last () {
    return this.#store.last?.data ?? null
  }

  get length () {
    return this.#store.recordCount
  }

  get records () {
    return this.#store.records.map(record => record.data)
  }

  add (record) {
    this.#store.add(record)
  }

  addFilter (cb) {
    this.#store.addFilter(cb)
    return this.#store.filtered
  }

  append (data) {
    this.#store.load(data)
  }

  clear () {
    this.#store.clear()
    this.emit('clear')
  }

  clearFilters (cb) {
    this.#store.clearFilters()
    return this.#store.records
  }

  delete (query) {
    const record = this.find(query)[0]

    if (!record) {
      throw new Error(`Record not found.`)
    }

    this.#store.remove(record)
    this.emit('record.delete', record)
  }

  filter (cb) {
    return this.#store.records.filter(cb)
  }

  find () {
    return this.#store.find(...arguments)
  }

  forEach (cb) {
    this.#store.records.forEach(record => cb(record.data))
  }

  get (index) {
    return this.#store.records[index]
  }

  has (record) {
    return this.#store.contains(record)
  }

  indexOf (record) {
    return this.#store.getRecordIndex(record)
  }

  load (data) {
    if (this.#store.recordCount > 0) {
      this.#store.clear()
    }

    for (let i = 0, length = data.length; i < length; i++) {
      this.#store.add(data[i], true)
    }

    this.emit('load', this.#store.records)

    // if (this.#store.recordCount > 0) {
    //   this.#suppressEvents = true
    //   return this.#store.reload(data)
    // }
    //
    // this.#store.load(data)
  }

  map (cb) {
    return this.#store.records.map(record => cb(record.data))
  }

  removeFilter (cb) {
    this.#store.removeFilter(cb)
    return this.#store.records
  }

  sort (cb) {
    this.#store.sort(cb)
    return this.#store.records
  }
}
