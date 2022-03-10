import Tracker from './Tracker.js'
import { reconcileNodes } from '../Renderer.js'
import { sanitizeString } from '../../utilities/StringUtils.js'

export default class ArrayTracker extends Tracker {
  get type () {
    return 'array'
  }

  generateNodes () {
    this.nodes = this.value.map(item => this.#generateNode(item))
    return this.nodes
  }

  #generateNode (item) {
    // TODO: Check for tags and render those

    return document.createTextNode(sanitizeString(item, this.retainFormatting))
  }

  copyWithin (index, start, end = this.nodes.length) {
    let count = 0
    let nodesToCopy = [...this.nodes].slice(start, end).map(node => node.cloneNode(true))

    for (let i = index, length = (end - start) + index; i < length; i++) {
      const nodeToReplace = this.nodes[i]

      if (!nodeToReplace) {
        throw new ReferenceError(`Cannot copy within tracked array. No node exists at index "${index}"`)
      }

      reconcileNodes(nodeToReplace, nodesToCopy[count])
      count++
    }
  }

  fill (update, start = 0, end = this.nodes.length) {
    for (let i = start; i < end; i++) {
      const existingNode = this.nodes[i]

      if (!existingNode) {
        throw new Error(`Invalid array fill parameters. No node exists at index "${i}"`)
      }

      reconcileNodes(existingNode, this.#generateNode(update))
    }
  }

  pop () {
    this.nodes.at(-1).remove()
    this.nodes.pop()
  }

  push (update) {
    const node = this.#generateNode(update)
    this.nodes.at(-1).after(node)
    this.nodes.push(node)
  }

  reverse () {
    const reversed = [...this.nodes].reverse().map(node => node.cloneNode(true))
    
    for (let i = 0, { length } = this.nodes; i < length; i++) {
      reconcileNodes(this.nodes[i], reversed[i])
    }
  }

  shift () {
    this.nodes[0].remove()
    this.nodes.shift()
  }

  sort () {
    console.log('sort')
  }

  splice (index, removeCount = 0, ...replacements) {
    let count = 0
    
    const newNodes = [...this.nodes]
    newNodes.splice(index, removeCount + index)

    for (let i = index, length = removeCount > 0 ? removeCount + index : this.nodes.length; i < length; i++) {
      const existingNode = this.nodes[i]
      const replacement = replacements[count]
      
      if (replacement) {
        const newNode = this.#generateNode(replacement)
        reconcileNodes(existingNode, newNode)
        newNodes.unshift(newNode)
      } else {
        existingNode.remove()
      }

      count++
    }

    this.nodes = newNodes
  }

  unshift (update) {
    const node = this.#generateNode(update)
    this.nodes.at(0).before(node)
    this.nodes.unshift(node)
  }
}