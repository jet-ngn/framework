import BaseContentBinding from './BaseContentBinding'
import { getTemplateRenderingTasks } from '../../rendering/Renderer'
import { reconcileNodes } from '../../rendering/Reconciler'
import { removeDOMEventsByNode } from '../../events/DOMBus'

// TODO: Support attached views/routers?

export default class ArrayContentBinding extends BaseContentBinding {
  * getReconciliationTasks ({ init = false, method = null } = {}) {
    yield * super.getReconciliationTasks(init, this.#getReconciliationTasks.bind(this, method))
  }

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
        this.replace([this.placeholder])
        next()
      }]
    }

    const templateElement = document.createElement('template')

    for (const template of current) {
      yield getTemplateRenderingTask(this.app, this.view, templateElement, template, this.childViews, this.routers, { append: true })
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
    const templates = current.slice((current.length - previous.length) * -1)
    const element = document.createElement('template')
    
    for (const template of templates) {
      yield getTemplateRenderingTask(this.app, this.view, element, template, this.childViews, this.routers, { append: true })
    }

    yield [`Append template`, ({ next }) => {
      const last = this.nodes.at(-1)
      const nodes = [...element.childNodes]

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
    const templates = this.value.slice(0, args.length)
    const element = document.createElement('template')
    
    for (const template of templates) {
      yield getTemplateRenderingTask(this.app, this.view, template, element, this.childViews, this.routers, { append: true })
    }

    yield [`Prepend template`, ({ next }) => {
      const first = this.nodes[0]
      const nodes = [...element.childNodes]

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