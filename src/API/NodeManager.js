import Constants from '../Constants.js'
import Template from '../renderer/Template.js'
import Tag from '../tag/Tag.js'

export default class NodeManager {
  static boundElements = new Map

  static batch (collection, size, renderFn) {
    return {
      type: 'batch',
      collection,
      size,
      renderFn
    }
  }

  static bind (context, config, tag, retainFormatting = false) {
    if (config instanceof Tag) {
      [config, tag] = [tag, config]
    }

    return {
      type: Constants.INTERPOLATION_BINDING,
      config,
      template: new Template(context, tag, retainFormatting)
    }
  }

  static bindRef (cfg, ref) {
    const bound = NodeManager.boundElements.get(ref)

    if (bound) {
      for (let { name, value } of ref.attributes) {
        ref.removeAttribute(name)
      }

      bound.attributes.forEach(({ name, value }) => ref.setAttribute(name, value))
      bound.cfg = cfg
    } else {
      NodeManager.boundElements.set(ref, {
        attributes: [...ref.attributes].map(({ nodeName, nodeValue }) => ({ name: nodeName, value: nodeValue })),
        cfg
      })
    }

    const { entity, attributes, data, on } = cfg
    entity[entity.initialized ? 'reinitialize' : 'initialize']({ element: ref.element, data: data ?? {} })
  }
}
