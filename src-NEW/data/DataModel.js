export default class DataModel extends NGN.EventEmitter {
  #model

  constructor (cfg) {
    super()

    const Model = new NGN.DATA.Model({ autoid: true, ...cfg })
    this.#model = new Model()

    if (cfg.hasOwnProperty('fields')) {
      Object.keys(cfg.fields).forEach(field => {
        Object.defineProperty(this, field, {
          get: () => this.#model[field],
          set: value => this.#model[field] = value
        })
      })
    }

    const self = this

    this.#model.on('*', function () {
      self.emit(this.event, ...arguments)
      // console.log(this.event)
    })
  }

  get data () {
    return this.#model.data
  }

  get representation () {
    return this.#model.representation
  }

  bind (field, process) {
    this.emit('bind', ...arguments)
  }

  load (data) {
    this.#model.load(data)
  }
}
