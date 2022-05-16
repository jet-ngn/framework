import IdentifiedClass from './IdentifiedClass'

export default class TreeNode extends IdentifiedClass {
  #children = []
  #parent
  #root
  
  constructor (parent, root, idPrefix) {
    super(idPrefix)
    this.#parent = parent
    this.#root = root
  }

  get children () {
    return this.#children
  }

  get parent () {
    return this.#parent
  }

  get root () {
    return this.#root
  }
}