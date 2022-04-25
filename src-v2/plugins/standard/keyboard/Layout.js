export default class Layout {
  #name

  constructor ({ name, map }) {
    this.#name = name

    Object.keys(map).forEach(key => {
      if (['Command', 'Control', 'Windows', 'Alt', 'Option', 'Shift'].includes(key)) {
        return
      }

      Reflect.defineProperty(this, key, {
        get: () => map[key]
      })
    })
  }

  get name () {
    return this.#name
  }
}
