export default class PluginManager {
  #plugins = {}

  get (name) {
    return this.#plugins[name] ?? null
  }

  load (plugins = {}) {
    Object.keys(plugins).forEach(name => {
      if (this.#plugins.hasOwnProperty(name)) {
        throw new Error(`Plugin "${name}" has already been defined`)
      }

      this.#plugins[name] = plugins[name]
    })
  }
}