import Base from './Base.js'

export default class Entity extends Base {
  #children = []
  #parent

  constructor (parent, root, { name, scope }) {
    super({
      ...arguments[2],
      name: name ?? 'Unnamed Entity',
      root,
      scope: `${parent ? `${parent.scope}.` : ''}${scope}`
    })

    this.#parent = parent ?? null
  }

  get children () {
    return this.#children
  }

  get parent () {
    return this.#parent
  }
}