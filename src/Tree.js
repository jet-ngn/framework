import IdentifiedClass from './IdentifiedClass'

export class TreeRoot extends IdentifiedClass {
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

export class TreeNode extends TreeRoot {
  #parent
  
  constructor (parent, root, idPrefix) {
    super(...arguments)
    this.#parent = parent
  }

  get parent () {
    return this.#parent
  }
}