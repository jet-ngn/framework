import IdentifiableClass from './IdentifiableClass.js'

export default class View extends IdentifiableClass {
  #description
  #name
  #parent
  #root
  #scope
  // #template
  #version

  constructor (parent, root, { data, description, name, routes, scope, version }, prefix) {
    super(prefix ?? 'view')
    // this.#data = new Trackable(data ?? {})
    this.#description = description ?? null
    this.#name = name ?? 'Unnamed Node'
    this.#parent = parent ?? null
    this.#root = root ?? null
    this.#scope = scope ?? this.id
    // this.#template = Reflect.get(cfg, 'template', this) ?? html``
    this.#version = version ?? null
    
    // const template = Reflect.get(arguments[2], 'template', this)
    // const parser = new Parser(this)
    // const renderer = new Renderer(parser.parse(template))
    // const output = parser.parse(template)
    // root.replaceChildren(output)
  }

  // get data () {
  //   return this.#data
  // }

  get description () {
    return this.#description
  }

  get name () {
    return this.#name
  }

  get parent () {
    return this.#parent
  }

  get root () {
    return this.#root
  }

  get scope () {
    return this.#scope
  }

  get version () {
    return this.#version
  }
}