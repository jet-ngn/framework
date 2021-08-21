import Constants from '../Constants.js'
import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Template from '../renderer/Template.js'
import Tag from '../tag/Tag.js'
import JobRegistry from '../registries/JobRegistry.js'
import Partial from '../API/Partial.js'

export default class FetchInterpolation extends MultipleChildInterpolation {
  #path

  get type () {
    return Constants.INTERPOLATION_FETCH
  }

  reconcile (update) {
    JobRegistry.addJob({
      name: 'Fetch and reconcile',

      callback: async (next) => {
        if (update.value.path === this.#path) {
          console.log('REC FETCH');
        } else {
          await this.#render(update.value)
        }
        
        update.rendered = this.rendered
        next()
      }
    })
  }

  render () {
    this.#path = this.value.path

    JobRegistry.addJob({
      name: 'Fetch and render',
      
      callback: async (next) => {
        await this.#render(this.value)
        next()
      }
    })

    this.rendered = [document.createComment(this.id)]
    return this.rendered[0]
  }

  #render = async ({ path, fallback = '' }) => {
    const extension = path.split('.').pop()
    let template

    if (!['html', 'svg'/*, 'md'*/].includes(extension)) {
      console.error(`${path} Invalid fetch request: *.${extension} files are not supported`)
      template = this.#generateTemplate(fallback)
    } else {
      const stream = await fetch(path)

      if (stream.status !== 200) {
        console.error(`${path} ${stream.status} ${stream.statusText}`, stream)
        template = this.#generateTemplate(fallback)
      } else {
        template = this.#generateTemplate(new Tag({
          type: extension,
          strings: [await stream.text()],
          interpolations: []
        }))
      }
    }

    const rendered = template.nodes.map(node => node.render())
    this.replaceWith(rendered)
    this.rendered = rendered
  }

  #generateTemplate = content => new Template(this.context, content, this.retainFormatting)
}