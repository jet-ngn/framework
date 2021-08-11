import Constants from '../Constants.js'
import MultipleChildInterpolation from './MultipleChildInterpolation.js'
import Template from '../renderer/Template.js'
import Tag from '../tag/Tag.js'

export default class FetchInterpolation extends MultipleChildInterpolation {
  get type () {
    return Constants.INTERPOLATION_FETCH
  }

  render () {
    const { path, throws } = this.value

    this.value.addJob({
      name: 'Fetch file',
      
      callback: async (next) => {
        const extension = path.split('.').pop()

        const reject = err => {
          if (throws) {
            throw new Error(err)
          }

          console.error(err)
        }

        const stream = await fetch(path).catch(reject)
        const raw = await stream.text().catch(reject)

        if (!['html', 'svg'/*, 'md'*/].includes(extension)) {
          throw new Error(`Invalid fetch request: *.${extension} files are not supported`)
        }

        const template = new Template(this.context, new Tag({
          type: extension,
          strings: [raw],
          interpolations: []
        }), this.retainFormatting)

        this.replaceWith(template.nodes.map(node => node.render()))
      }
    })

    this.rendered = [document.createComment(this.id)]
    return this.rendered[0]
  }
}