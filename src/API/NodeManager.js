import Template from '../renderer/Template.js'
import Tag from '../tag/Tag.js'

export default class NodeManager {
  static batch (collection, size, renderFn) {
    return {
      type: 'batch',
      collection,
      size,
      renderFn
    }
  }

  static bind (context, cfg, tag, retainFormatting = false) {
    if (cfg instanceof Tag) {
      [cfg, tag] = [tag, cfg]
    }

    return {
      type: 'bind',
      config: cfg,
      template: new Template(context, tag, retainFormatting)
    }
  }
}
