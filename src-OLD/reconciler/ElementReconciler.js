import Reconciler from './Reconciler.js'
import DOMEventRegistry from '../registries/DOMEventRegistry.js'

export default class ElementReconciler extends Reconciler {
  #reconcileEventListeners = update => {
    const listeners = {
      current: this.context.eventListeners,
      update: update.eventListeners
    }

    if (!this.context.hasEventListeners) {
      return this.addJob({
        name: 'Add event listeners',
        data: listeners,

        callback: next => {
          this.context.addEventListeners(listeners.update)
        }
      })
    }

    Object.keys({ ...listeners.update, ...listeners.current }).forEach(listener => {
      const evt = listener
      const change = {
        current: (listeners.current[evt] ?? [])[0] ?? null,
        update: (listeners.update[evt] ?? [])[0] ?? null
      }

      if (change.update) {
        if (change.current) {
          return this.#reconcileEventListener(evt, change)
        }

        return this.addJob({
          name: 'Add event Listener',
          data: { evt, callback: change.update },

          callback: next => {
            this.context.addEventListener(evt, change.update)
            next()
          }
        })
      }

      this.addJob({
        name: 'Remove event listener',
        data: { evt, handler: change.current },

        callback: next => {
          this.context.removeEventListener(evt, change.current)
          next()
        }
      })
    })
  }

  #reconcileAttributes = update => {
    const attributes = {
      current: this.context.attributes,
      update: update.attributes
    }

    if (!this.context.hasAttributes) {
      return this.addJob({
        name: `Add attributes`,
        triggersLayout: true,
        data: attributes,

        callback: next => {
          this.context.setAttributes(attributes.update)
          next()
        }
      })
    }

    Object.keys({ ...attributes.update, ...attributes.current }).forEach(attribute => {
      const name = attribute

      const change = {
        current: attributes.current[attribute],
        update: attributes.update[attribute]
      }

      if (change.update) {
        if (change.current) {
          return this.#reconcileAttribute(name, change)
        }

        return this.addJob({
          name: 'Add attribute',
          triggersLayout: true,
          data: { name, value: change.update },

          callback: next => {
            this.context.setAttribute(name, change.update)
            next()
          }
        })
      }

      this.addJob({
        name: 'Remove attribute',
        triggersLayout: true,
        data: name,

        callback: next => {
          this.context.removeAttribute(name)
          next()
        }
      })
    })
  }

  reconcile (update, isCustomElement) {
    this.clear()

    // let exempt = isCustomElement ? this.context.source.reconcilerConfig?.exempt : []

    if (update.hasAttributes) {
      this.#reconcileAttributes(update)
    } else {
      this.addJob({
        name: 'Remove all attributes',
        triggersLayout: true,
        data: this.context.attributes,

        callback: next => {
          this.context.removeAllAttributes()
          next()
        }
      })
    }

    if (update.hasEventListeners) {
      this.#reconcileEventListeners(update)
    } else {
      this.addJob({
        name: 'Remove all event listeners',
        data: this.context.eventListeners,

        callback: next => {
          this.context.removeAllEventListeners()
          next()
        }
      })
    }

    let length = this.context.nodes.length

    if (length > 0) {
      for (let i = length - 1; i >= 0; i--) {
        const current = this.context.nodes[i]

        // if (exempt.includes(current.source)) {
        //   continue
        // }

        this.addJob({
          name: 'Reconcile Child Node',
          triggersLayout: true,

          data: {
            current,
            update: update.nodes[i]
          },

          callback: next => {
            const node = {
              current,
              update: update.nodes[i]
            }

            if (node.update) {
              if (node.update.type === node.current.type) {
                node.current.reconcile(node.update)
              } else {
                node.current.replaceWith(node.update.render())
              }
            }

            // TODO: Find out if any logic is needed here to reconcile
            // event handlers

            next()
          }
        })
      }
    }

    if (this.layoutJobs.length > 2) {
      this.context.hide()
    }

    this.run(() => {
      if (this.ref) {
        this.context.context.removeReference(this.ref)
      }

      update.source = this.context.source

      if (this.context.hidden) {
        this.context.show()
      }
    })
  }

  #reconcileAttribute = (attribute, change) => {
    if (change.update === change.current) {
      return
    }

    if (!change.update) {
      return this.addJob({
        name: 'Remove Attribute',
        triggersLayout: true,
        data: attribute,

        callback: next => {
          this.context.removeAttribute(attribute)
          next()
        }
      })
    }

    this.addJob({
      name: 'Set Attribute',
      triggersLayout: true,

      data: {
        name: attribute,
        change
      },

      callback: next => {
        this.context.setAttribute(attribute, change.update)
        next()
      }
    })
  }

  #reconcileEventListener = (evt, change) => {
    if (change.current.callback === change.update.callback) {
      return
    }

    this.addJob({
      name: 'Reconcile event listener',
      data: { evt, change },

      callback: next => {
        // TODO: write a replace function on DOMEventRegistry
        this.context.removeEventListener(evt, change.current)
        this.context.addEventListener(evt, change.update.callback)
        next()
      }
    })
  }
}

// if (update.hasAttributes) {
//   this.reconcileProperties({
//     name: 'attribute',
//     plural: 'attributes',
//     addAll: 'setAttributes',
//     addOne: 'setAttribute',
//     collection: 'attributes',
//     get: 'getAttribute',
//     hasAny: 'hasAttributes',
//     hasOne: 'hasAttribute',
//     reconcile: this.#reconcileAttribute,
//     remove: 'removeAttribute'
//   }, update)
// } else {
//   this.addJob({
//     name: 'Remove all attributes',
//     triggersLayout: true,
//     data: this.context.attributes,
//
//     callback: next => {
//       this.context.removeAllAttributes()
//       next()
//     }
//   })
// }

// if (update.hasEventListeners) {
//   this.reconcileProperties({
//     addAll: 'addEventListeners',
//     addOne: 'addEventListener',
//     collection: 'eventListeners',
//     get: 'getEventListeners',
//     hasAny: 'hasEventListeners',
//     hasOne: 'hasEventListener',
//     reconcile: this.#reconcileEventListeners,
//     remove: 'removeEventListener'
//   }, update)
// } else {
//   this.addJob({
//     name: 'Remove all event listeners',
//     triggersLayout: false,
//     data: this.context.eventListeners,
//
//     callback: next => {
//       console.log('REMOVE ALL LISTENERS')
//       // this.context.removeAllAttributes()
//       next()
//     }
//   })
// }
