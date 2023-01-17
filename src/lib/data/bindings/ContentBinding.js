import BaseContentBinding from './BaseContentBinding'

import HTMLTemplate from '../../parsing/templates/HTMLTemplate'
import SVGTemplate from '../../parsing/templates/SVGTemplate'

import { getTemplateRenderingTasks } from '../../rendering/Renderer'
import { reconcileNodes } from '../../rendering/Reconciler'
import { sanitizeString } from '../../../utilities/StringUtils'

export default class ContentBinding extends BaseContentBinding {
  * getReconciliationTasks ({ init = false } = {}, stagedViews) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this, stagedViews))
  }

  * #getReconciliationTasks (stagedViews, init, change) {
    const { current } = change

    if (current === null || current?.length === 0) {
      return yield [`Replace nodes`, ({ next }) => {
        this.replace([this.placeholder])
        next()
      }]
    }

    // TODO: Support svg
    if (current instanceof HTMLTemplate) {
      const element = document.createElement('template')

      yield * getTemplateRenderingTasks(this.app, this.view, element, current, this.childViews, this.routers, stagedViews)

      // TODO: Try reconciling instead of always replacing?
      return yield [`Reconcile template`, ({ next }) => {
        this.replace([...element.childNodes])
        next()
      }]

    } else if (current instanceof SVGTemplate) {
      throw new Error(`SVG is currently not supported in Content Bindings`)
    }

    yield [`${init ? `Initialize` : `Reconcile`} Content Binding`, ({ next }) => {
      this.nodes = reconcileNodes(this.nodes, this.#getUpdate(change))
      next()
    }]
  }

  #getUpdate ({ current }) {
    switch (typeof current) {
      case 'string':
      case 'number':
      case 'boolean':
        const value = current !== false ? `${current}` : ''  
        return [document.createTextNode(this.retainFormatting ? sanitizeString(value) : value)]
      
      // case 'object': return [document.createTextNode(sanitizeString(JSON.stringify(value, null, 2), { retainFormatting: true }))]
  
      default: throw new TypeError(`Invalid binding value type "${typeof current}"`)
    }
  }
}