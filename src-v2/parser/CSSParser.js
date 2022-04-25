import ElementNode from './ElementNode.js'
import TextNode from './TextNode.js'
import CommentNode from './CommentNode.js'

export default class CSSParser {
  static parse (tag) {
    const { strings, interpolations } = tag
    let css = ''

    for (let i = 0, length = strings.length; i < length; i++) {
      css += strings[i]

      if (i >= interpolations.length) {
        continue
      }

      css += interpolations[i]
    }

    return css
  }
}
