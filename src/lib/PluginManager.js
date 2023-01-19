export default class PluginManager {
  #reserved = new Set(['load'])

  load (plugins = {}) {
    Object.keys(plugins).forEach(name => {
      name = name.trim()

      if (this.hasOwnProperty(name)) {
        throw new Error(`Plugin "${name}" has already been defined`)
      }

      if (this.#reserved.has(name)) {
        throw new Error(`Plugins: "${name}" is a reserved word`)
      }

      this[name] = plugins[name]
    })
  }
}