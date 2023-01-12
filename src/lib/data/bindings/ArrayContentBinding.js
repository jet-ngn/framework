import BaseContentBinding from './BaseContentBinding'
import { getTemplateRenderingTasks } from '../../rendering/Renderer'
import { reconcileNodes } from '../../rendering/Reconciler'
import { removeDOMEventsByNode } from '../../events/DOMBus'

export default class ArrayContentBinding extends BaseContentBinding {
  * #getReconciliationTasks (method, init, { previous, current }) {
    if (!!method) {
      switch (method) {
        case 'push': return yield * this.#push(previous, current)
        case 'pop': return yield * this.#pop()
        case 'shift': return yield * this.#shift()
        case 'unshift': return yield * this.#unshift(previous)
        default: break
      }
    }

    if (current?.length === 0) {
      return yield [`Replace nodes`, ({ next }) => {
        console.log('TODO: Replace nodes with placeholder')
        next()
      }]
    }

    const templateElement = document.createElement('template')

    for (const template of current) {
      yield * getTemplateRenderingTasks(this.app, this.view, template, templateElement, this.childViews, this.routers, { append: true })
    }

    if (init) {
      return yield [`Replace template`, ({ next }) => {
        this.replace([...templateElement.childNodes])
        next()
      }]
    }

    yield [`Reconcile templates`, ({ next }) => {
      this.nodes = reconcileNodes(this.nodes, [...templateElement.childNodes])
      next()
    }]
  }

  * getReconciliationTasks ({ init = false, method = null }) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this, method))
  }

  * #pop () {
    yield [`Remove template from end`, ({ next }) => {
      const last = this.nodes.pop()

      if (last) {
        removeDOMEventsByNode(last)
        // removeViewByNode(this.childViews, last)
        last.remove()
      }

      next()
    }]
  }

  * #push (previous, current) {
    const newTemplates = current.slice((current.length - previous.length) * -1)
    const template = document.createElement('template')
    
    for (const newTemplate of newTemplates) {
      yield * getTemplateRenderingTasks(this.app, this.view, newTemplate, template, this.childViews, this.routers, { append: true })
    }

    yield [`Append template`, ({ next }) => {
      const last = this.nodes.at(-1)
      const nodes = [...template.childNodes]

      if (!last || last === this.placeholder) {
        this.placeholder.replaceWith(...nodes)
        this.nodes = nodes
      } else {
        last.after(...nodes)
        this.nodes.push(...nodes)
      }

      next()
    }]
  }

  * #shift () {
    yield [`Remove template from beginning`, ({ next }) => {
      const first = this.nodes.shift()

      if (first) {
        removeDOMEventsByNode(first)
        // removeViewByNode(this.childViews, first)
        first.remove()
      }

      next()
    }]
  }

  * #unshift (...args) {
    const newTemplates = this.value.slice(0, args.length)
    const template = document.createElement('template')
    
    for (const newTemplate of newTemplates) {
      yield * getTemplateRenderingTasks(this.app, this.view, newTemplate, template, this.childViews, this.routers, { append: true })
    }

    yield [`Prepend template`, ({ next }) => {
      const first = this.nodes[0]
      const nodes = [...template.childNodes]

      if (!first || first === this.placeholder) {
        this.placeholder.replaceWith(...nodes)
        this.nodes = nodes
      } else {
        first.before(...nodes)
        this.nodes.unshift(...nodes)
      }

      next()
    }]
  }
}