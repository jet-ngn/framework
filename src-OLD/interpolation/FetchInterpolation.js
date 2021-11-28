import Constants from '../Constants.js'
import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Template from '../renderer/Template.js'
import Tag from '../tag/Tag.js'
import JobRegistry from '../registries/JobRegistry.js'

export default class FetchInterpolation extends MultipleChildInterpolation {
  template

  get type () {
    return Constants.INTERPOLATION_FETCH
  }

  reconcile (update) {
    JobRegistry.addJob({
      name: 'Fetch and reconcile',

      callback: async (next) => {
        const template = await this.#generateTemplate(update.value)

        if (update.value.path === this.value.path) {
          this.template.reconcile(template)
          update.rendered = this.rendered
        } else {
          const rendered = template.nodes.map(node => node.render())
          this.replaceWith(rendered)
          update.rendered = rendered
        }

        update.template = template
        next()
      }
    })
  }

  render () {
    JobRegistry.addJob({
      name: 'Fetch and render',
      
      callback: async (next) => {
        this.template = await this.#generateTemplate(this.value)
        
        const rendered = this.template.nodes.map(node => node.render())
        this.replaceWith(rendered)
        this.rendered = rendered

        next()
      }
    })

    this.rendered = [document.createComment(this.id)]
    return this.rendered[0]
  }

  #generateTemplate = async ({ path, fallback }) => {
    const extension = path.split('.').pop()
    let template

    if (!['html', 'svg'/*, 'md'*/].includes(extension)) {
      console.error(`${path} Invalid fetch request: *.${extension} files are not supported`)
      template = new Template(this.context, fallback, this.retainFormatting)
    } else {
      const stream = await fetch(path)

      switch (stream.status) {
        case 200: 
          template = new Template(this.context, new Tag({
            type: extension,
            strings: [await stream.text()],
            interpolations: []
          }), this.retainFormatting)
          
          break
      
        default:
          console.info(stream)
          template = new Template(this.context, fallback, this.retainFormatting)
          break
      }
    }

    return template
  }
}