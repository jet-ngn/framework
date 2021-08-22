import Tag from '../tag/Tag.js'
import AssetRegistry from '../registries/AssetRegistry.js'
import { Bus } from '../index.js'

class Assets {
  static async load (assets) {
    Bus.emit('assets.load')
    assets = Array.isArray(assets) ? assets : [assets]

    for await (let { name, path } of assets) {
      const extension = path.split('.').pop()

      if (!['html', 'svg'/*, 'md'*/].includes(extension)) {
        console.error(`${path} Invalid Asset: "${extension}" files are not supported`)
        continue
      }

      const stream = await fetch(path).catch(console.error)
      
      if (!stream.ok) {
        continue
      }

      AssetRegistry.registerAsset(name, path, new Tag({
        type: extension,
        strings: [await stream.text()],
        interpolations: []
      }))
    }

    Bus.emit('assets.loaded')
  }

  static get (name) {
    return AssetRegistry.getAsset(name)
  }
}

export { Assets as default }