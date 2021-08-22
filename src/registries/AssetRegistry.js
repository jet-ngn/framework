class AssetRegistry {
  #assets = {}

  // deregisterAsset () {}

  getAsset (name) {
    if (!this.hasAsset(name)) {
      return console.error(`Asset "${name}" has not been registered.`)
    }

    return this.#assets[name].tag
  }

  hasAsset (name) {
    return this.#assets.hasOwnProperty(name)
  }

  registerAsset (name, path, tag) {
    if (this.hasAsset(name)) {
      return console.error(`Asset "${name}" already exists. Please choose a different name.`)
    }

    this.#assets[name] = { path, tag }
  }

  // replaceAsset () {}
}

export default new AssetRegistry()