import ElementNode from './ElementNode.js'
import TextNode from './TextNode.js'
import CommentNode from './CommentNode.js'

export default class HTMLParser {
  static #template = document.createElement('template')

  static createNode (node, context, { interpolationManager, retainFormatting }) {
    if (node.nodeName === 'SCRIPT') {
      return null
    }

    switch (node.nodeType) {
      case 1: return new ElementNode(node, context, interpolationManager)

      case 3:
        const { processed, valid } = this.#processTextNode(node, retainFormatting)
        return valid ? new TextNode(processed, context, interpolationManager) : null

      case 8: return new CommentNode(node, context, interpolationManager)

      default: return null
    }
  }

  static createNodes (nodes, context, { interpolationManager, retainFormatting = false }) {
    return nodes.reduce((nodes, node) => {
      switch (node.nodeType) {
        case 1:
        case 3: // Element || Text
          node = HTMLParser.createNode(node, context, arguments[2])
          node && nodes.push(node)
          break

        case 8: // Comment
          interpolationManager.hasInterpolation(node.data) ? nodes.push(interpolationManager.getInterpolation(node.data)) : nodes.push(HTMLParser.createNode(node, context, interpolationManager))
          break
      }

      return nodes
    }, [])
  }

  static escapeString (string) {
    const textarea = document.createElement('textarea')
    textarea.textContent = string
    return textarea.innerHTML
  }

  static normalizeString (string) {
    return string.replace(/\r?\n|\r/g, '')//.replace(/\s+/g, ' ')
  }

  static parse ({ context, tag, id, interpolationManager, retainFormatting }) {
    const { strings, interpolations } = tag
    let html = ''

    for (let i = 0, length = strings.length; i < length; i++) {
      html += strings[i]

      if (i >= interpolations.length) {
        continue
      }

      let interpolation = interpolations[i]

      if (interpolation === undefined) {
        interpolation = ''
      } else if (interpolation === null) {
        continue
      }

      interpolation = interpolationManager.addInterpolation(interpolation, i)

      if (interpolation.type === 'text' && ['string', 'number'].includes(typeof interpolation.value)) {
        html += this.#processString('' + interpolation.value, retainFormatting)
        continue
      }

      html += `<!--${interpolation.id}-->`
    }

    this.#template.innerHTML = html

    const result = {
      html,
      nodes: HTMLParser.createNodes([...this.#template.content.childNodes], context, {
        interpolationManager,
        retainFormatting
      })
    }

    this.#template.innerHTML = ''
    return result
  }

  static #processString = (string, retainFormatting) => {
    return HTMLParser.escapeString(retainFormatting ? string : HTMLParser.normalizeString(string))
  }

  static #processTextNode = (node, retainFormatting) => {
    node.data = this.#processString(node.data, retainFormatting)

    return {
      processed: node,
      valid: retainFormatting ? true : node.data.trim() !== ''
    }
  }
}
