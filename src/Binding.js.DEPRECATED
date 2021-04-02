export default class Binding {
  #cfg
  #element
  #on
  #entity
  #data
  #attributes

  constructor (element, cfg) {
    this.#cfg = cfg
    this.#element = element
    this.#on = cfg.on ?? null
    this.#entity = cfg.entity ?? null
    this.#data = cfg.data ?? null
    this.#attributes = this.#processAttributes(cfg.attributes)
  }

  get attributes () {
    return this.#attributes
  }

  get element () {
    return this.#element
  }

  get entity () {
    return this.#entity
  }

  get data () {
    return this.#data
  }

  get on () {
    return this.#on
  }

  applyAttributes () {
    const classList = this.#attributes['class']

    if (classList) {
      if (Array.isArray(classList)) {
        this.#element.addClass(...classList)
      } else {
        this.#element.addClass(classList)
      }

      delete this.#attributes['class']
    }

    this.#element.setAttributes(this.#attributes)
  }

  #processAttribute = (name, value) => {
    const type = NGN.typeof(value)

    switch (type) {
      case 'array': return this.#resolveList(value)

      case 'object':
        if (value.type && value.type === 'data') {
          value.bindAttribute(this.#element, name, this.#element.context instanceof HTMLElement)
          return value.initialValue
        }

        return value

      case 'boolean': return value

      case 'string':
      case 'number': return HTMLParser.escapeString(`${value}`)

      default: throw new TypeError(`Invalid attribute "${name}"`)
    }
  }

  #processAttributes = attributes => {
    if (!attributes) {
      return {}
    }

    const type = NGN.typeof(attributes)

    if (type !== 'object') {
      throw new TypeError(`bind() attributes configuration: Expected object, received ${type}`)
    }

    return Object.keys(attributes).reduce((result, name) => {
      const value = attributes[name]
      const processed = this.#processAttribute(name, value)

      if (NGN.typeof(processed) === 'object') {
        Object.keys(processed).forEach(attribute => {
          const val = processed[attribute]
          result[`${name}-${attribute}`] = this.#processAttribute(attribute, typeof val === 'boolean' ? `${val}` : val)
        })
      } else {
        result[name] = processed
      }

      return result
    }, {})
  }

  #resolveList = arr => {
    return arr.reduce((list, item) => {
      if (NGN.typeof(item) === 'object') {
        list.push(...Object.keys(item).filter(key => item[key] === true))
      } else {
        list.push(HTMLParser.escapeString(`${item}`))
      }

      return list
    }, [])
  }
}