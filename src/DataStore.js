import NGN from 'NGN'
import DataModel from './DataModel.js'

export default class DataStore extends NGN.EventEmitter {
  #model
  #records = []

  constructor (model) {
    super()
    this.#model = model
  }

  get records () {
    return this.#records
  }

  get toJSON () {
    return this.#records.map(record => record.toJSON)
  }

  add (data, fireEvent = true) {
    const record = new DataModel(this.#model)
    
    record.load(data)
    this.#records.push(record)
    record.on('field.change', change => this.emit('record.change', { record, ...change }))

    if (fireEvent) {
      this.emit('record.create', record)
    }
  }

  filter (cb) {
    if (typeof cb !== 'function') {
      throw new TypeError(`DataStore filter method expected callback function, received "${typeof cb}"`)
    }

    return this.#records.filter(cb)
  }

  find (query) {
    return this.#records.reduce((result, record) => {
      let include = true

      forEachKey(query, (key, value) => {
        if (!include) {
          return false
        }

        if (record[key] === value) {
          return result.push(record)
        }

        include = false
      })

      return result
    }, [])
  }

  load (data) {
    if (!Array.isArray(data)) {
      throw new TypeError(`DataStore "load" method expected array of objects, received "${typeof data}"`)
    }

    data.forEach(obj => this.add(obj, false))
    this.emit('load', this.#records)
  }

  sort (field) {
    if (typeof field === 'function') {
      return this.#records.sort(field)
    }

    console.log('SORT BY ', field)
  }
}