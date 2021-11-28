import Plugin from './Plugin.js'

export default class PluginManager {
  #plugins = []

  constructor (context, plugins) {
    if (plugins.length === 0) {
      return
    }

    plugins.forEach(plugin => {
      const type = NGN.typeof(plugin)

      if (type !== 'object') {
        throw new TypeError(`Plugin: Expected object, received ${type}`)
      }

      this.#plugins[plugin.name] = new Plugin(plugin)
    })
  }

  get plugins () {
    return Object.values(this.#plugins)
  }

  get (pluginName) {
    const plugin = this.#plugins[pluginName]

    if (!plugin) {
      throw new ReferenceError(`Plugin "pluginName" not found`)
    }

    return plugin
  }

  // #processPlugin = plugin => {
  //   if (plugin.hasOwnProperty('dependencies')) {
  //     plugin.dependencies.forEach(dependency => {
  //       if (!this.#plugins.hasOwnProperty(dependency.name)) {
  //         this.#plugins[dependency.name] = new Plugin(dependency)
  //       }
  //     })
  //   }
  //
  //   this.#plugins[plugin.name] = new Plugin(plugin)
  // }
}
