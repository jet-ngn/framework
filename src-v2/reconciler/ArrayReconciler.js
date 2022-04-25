import Reconciler from './Reconciler.js'
import Renderer from '../renderer/Renderer.js'
import DOMEventRegistry from '../registries/DOMEventRegistry.js'

export default class ArrayReconciler extends Reconciler {
  reconcile (update) {
    this.clear()

    const templates = {
      current: this.context.value,
      update: update.value
    }

    const length = Math.max(templates.current.length, templates.update.length)
    const fragment = document.createDocumentFragment()
    const trash = []
    let placeholder

    if (length === 0) {
      update.placeholder = this.context.placeholder
      return
    }

    for (let i = 0; i < length; i++) {
      const change = {
        current: templates.current[i] ?? null,
        update: templates.update[i] ?? null
      }

      if (!change.update) {
        const { nodes } = change.current

        for (let n = nodes.length - 1; n >= 0; n--) {
          trash.push(nodes[n])
          placeholder = update.placeholder
        }

        continue
      }

      if (!change.current) {
        Renderer.appendNodes(fragment, change.update)
        continue
      }

      this.addJob({
        name: 'Reconcile Template',
        data: change,
        triggersLayout: true,

        callback: next => {
          change.current.reconcile(change.update)
          next()
        }
      })
    }

    if (trash.length > 0) {
      this.addJob({
        name: 'Remove Nodes',
        data: trash,
        triggersLayout: true,

        callback: next => {
          while (trash.length > 1) {
            trash[trash.length - 1].remove(false)
            trash.pop()
          }

          if (templates.update.length === 0) {
            trash[0].replaceWith(placeholder)
          } else {
            trash[trash.length - 1].remove(false)
          }

          next()
        }
      })
    }

    if (fragment.childNodes.length > 0) {
      this.addJob({
        name: 'Add Nodes',
        data: fragment,
        triggersLayout: true,

        callback: next => {
          if (templates.current.length === 0) {
            this.context.placeholder.replaceWith(fragment)
          } else {
            const lastNode = templates.current[templates.current.length - 1].lastNode
            lastNode.insertAfter(fragment)
          }

          next()
        }
      })
    }

    this.run()
  }
}
