import Tag from '../tag/Tag.js'
import AssetRegistry from '../registries/AssetRegistry.js'
import { Bus } from '../index.js'

class Assets {
  static async load (assets) {
    Bus.emit('assets.load')

    assets = Array.isArray(assets) ? assets : [assets]

    await Promise.all(assets.map(({ name, path }) => {
      const extension = path.split('.').pop()

      if (!['html', 'svg'/*, 'md'*/].includes(extension)) {
        console.error(`${path} Invalid Asset: "${extension}" files are not supported`)
        return null
      }

      return fetch(path).then(async (response) => {
        if (!response.ok) {
          return
        }

        AssetRegistry.registerAsset(name, path, new Tag({
          type: extension,
          strings: [await response.text()],
          interpolations: []
        }))
      }).catch(console.error)
    }).filter(Boolean))

    Bus.emit('assets.loaded')
  }

  static get (name) {
    return AssetRegistry.getAsset(name)
  }
}

export { Assets as default }