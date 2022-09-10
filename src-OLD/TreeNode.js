import IdentifiedClass from './IdentifiedClass'

export default class TreeNode extends IdentifiedClass {
  #children = []
  #root
  
  constructor (parent, root, idPrefix) {
    super(idPrefix)
    this.#root = root
  }

  get children () {
    return this.#children
  }

  get root () {
    return this.#root
  }
}