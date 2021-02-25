import ParsedNode from './ParsedNode.js'

export default class TextNode extends ParsedNode {
  get type () {
    return 'text'
  }

  get value () {
    return this.source.nodeValue
  }

  reconcile (update) {
    if (update.value === this.value) {
      update.source = this.source
      return
    }

    this.source.replaceWith(update.render())
  }

  render () {
    return this.source
  }
}
