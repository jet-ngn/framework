import ParsedNode from './ParsedNode.js'

export default class CommentNode extends ParsedNode {
  get data () {
    return this.source.data
  }

  set data (value) {
    this.source.data = value
  }

  get type () {
    return 'comment'
  }

  reconcile (update) {
    if (update.data !== this.data) {
      this.data = update.data
    }

    update.source = this.source
  }

  render () {
    return this.source
  }
}
