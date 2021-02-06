import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Renderer from '../renderer/Renderer.js'
import Template from '../renderer/Template.js'

// TODO: Consider using an intersection observer to determine which batch the
// user is currently viewing. This way, when it comes time to reconcile, the
// batch currently in view can be reconciled first.

class Task {
  #context
  #tags
  #templates = []
  #message
  #renderFn
  #retainFormatting

  constructor (context, tags, message, renderFn, retainFormatting) {
    this.#context = context
    this.#tags = tags
    this.#message = message
    this.#renderFn = renderFn
    this.#retainFormatting = retainFormatting ?? false
  }

  get templates () {
    return this.#templates
  }

  render () {
    const fragment = document.createDocumentFragment()

    for (let i = 0, length = this.#tags.length; i < length; i++) {
      const tag = this.#tags[i]
      const template = new Template(this.#context, this.#renderFn.call(this.context, tag, i, this.#tags), this.#retainFormatting)
      this.#templates.push(template)
      Renderer.appendNodes(fragment, template)
    }

    return fragment
  }

  reconcile (templates) {
    for (let i = 0, length = this.#templates.length; i < length; i++) {
      this.#templates[i].reconcile(templates[i])
    }
  }
}

export default class BatchInterpolation extends MultipleChildInterpolation {
  #type
  #collection
  #size
  #tasks = []

  constructor (context, interpolation, index, retainFormatting) {
    super(...arguments)

    this.#type = interpolation.type
    this.#collection = interpolation.collection
    this.#size = interpolation.size

    for (let i = 0, length = this.#collection.length; i < length; i += this.#size) {
      const tags = this.#collection.slice(i, i + this.#size)
      this.#tasks.push(new Task(this.context, tags, `${i} to ${i + this.#size} of ${this.#collection.length}`, interpolation.renderFn, retainFormatting))
    }
  }

  get tasks () {
    return this.#tasks
  }

  reconcile (update) {
    const first = update.tasks[0]
    first.render()

    this.#tasks[0].reconcile(first.templates)

    window.requestIdleCallback(() => {
      const queue = new NGN.Tasks()

      queue.on('complete', () => {
        update.rendered = this.rendered
      })

      for (let i = 1, length = update.tasks.length; i < length; i++) {
        const task = update.tasks[i]

        queue.add(`Reconciling ${task.message}`, next => {
          window.requestIdleCallback(() => {
            task.render()
            this.#tasks[i].reconcile(task.templates)
            next()
          })
        })
      }

      queue.run()
    })
  }

  render () {
    const fragment = this.#tasks[0].render()

    window.requestIdleCallback(() => {
      const queue = new NGN.Tasks()

      for (let i = 1, length = this.#tasks.length; i < length; i++) {
        const task = this.#tasks[i]

        queue.add(`Rendering ${task.message}`, next => {
          window.requestIdleCallback(() => {
            const chunk = task.render(document.createDocumentFragment())
            const lastElement = this.rendered[this.rendered.length - 1]
            this.rendered.push(...chunk.childNodes)
            lastElement.parentNode.insertBefore(chunk, lastElement.nextSibling)
            next()
          })
        })
      }

      queue.run(true)
    })

    this.rendered = [...fragment.childNodes]
    return fragment
  }
}
