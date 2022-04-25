import Base from './Base.js'
// import { Trackable } from '../Trackable.js'

export default class Entity extends Base {
  #children = []
  #data
  #parent

  constructor (parent, root, { name, scope }) {
    super({
      ...arguments[0],
      name: name ?? 'Unnamed Entity',
      root,
      scope: `${parent ? `${parent.scope}.` : ''}${scope}`
    })

    // this.#data = !!data ? new Trackable(data) : {}
    this.#parent = parent ?? null
  }

  get children () {
    return this.#children
  }

  get data () {
    return this.#data
  }

  get parent () {
    return this.#parent
  }

  // emit () {
  //   console.log('EMIT')
  // }
}