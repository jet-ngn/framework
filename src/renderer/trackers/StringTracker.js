import Tracker from './Tracker.js'

export default class StringTracker extends Tracker {
  get type () {
    return 'string'
  }

  generateNodes () {
    this.nodes = [this.#generateNode()]
    return this.nodes
  }

  update () {
    super.update(node => node.data = node.data === this.value ? node.data : this.value)
  }

  #generateNode () {
    // TODO: Handle transforms that produce tags or other output

    return document.createTextNode(this.value)
  }
}