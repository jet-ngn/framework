import Constants from '../Constants.js'
import Template from '../renderer/Template.js'
import Tag from '../tag/Tag.js'

export default class NodeManager {
  static boundRefs = new Map

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

  static bindRef (context, cfg, ref) {
    const bound = NodeManager.boundRefs.get(ref)
    const { entity, attributes, data, on } = cfg

    if (!bound) {
      const template = document.createElement('template')
      template.innerHTML = ref.innerHTML

      NodeManager.boundRefs.set(ref, {
        attributes: [...ref.attributes].map(({ nodeName, nodeValue }) => ({ name: nodeName, value: nodeValue })),
        cfg,
        initialChildren: template.content.cloneNode(true)
      })
    }

    if (!!entity) {
      const update = {
        current: bound?.cfg?.entity,
        next: entity
      }

      if (!!bound && !!update.current && !!update.next) {
        ref.innerHTML = ''
        ref.append(bound.initialChildren.cloneNode(true))
      }

      entity[entity.initialized ? 'reinitialize' : 'initialize']({
        element: ref.element,
        data: data ?? {},
        manager: context
      })
    }

    if (!!bound) {
      // for (let { name, value } of ref.attributes) {
      //   ref.removeAttribute(name)
      // }

      // bound.attributes.forEach(({ name, value }) => ref.setAttribute(name, value))
      bound.cfg = cfg
    }
  }
}
