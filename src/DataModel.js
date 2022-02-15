import NGN from 'NGN'
import { forEachKey } from './utilities.js'

// TODO: Consider adding Typed Arrays and other standard lib types

export default class DataModel extends NGN.EventEmitter {
  #fields = {}
  #history = []

  constructor (config = {}) {
    super()
    forEachKey(config, this.addField.bind(this))
  }

  get fields () {
    return this.#fields
  }

  get isValid () {
    return Object.values(this.#fields).reduce((valid, field) => {
      if (!field.isValid) {
        valid = false
      }

      return valid
    }, true)
  }
  
  get invalidFields () {
    return Object.keys(this.#fields).reduce((fields, field) => {
      if (!this.#fields[field].isValid) {
        fields.push(field)
      }

      return fields
    }, [])
  }

  get toJSON () {
    return Object.keys(this.#fields).reduce((obj, field) => {
      obj[field] = this.#fields[field].value
      return obj
    }, {})
  }

  addField (name, cfg) {
    if (this.#fields.hasOwnProperty(name)) {
      throw new Error(`Duplicate data field "${name}"`)
    }
    
    const field = makeDataField(this, name, cfg)
    this.#fields[name] = field
    
    Object.defineProperty(this, name, {
      get: () => field.value,
      set: value => field.value = value
    })

    return field
  }

  load (data) {
    if (typeof data !== 'object') {
      throw new TypeError(`DataModel load method expected object, received ${typeof data}`)
    }

    Object.keys(data).forEach(name => {
      const field = this.#fields[name]

      if (!field) {
        return
      }

      field.value = data[name]
    })

    this.emit('load', this.toJSON)
  }
}

function makeDataField (model, name, cfg) {
  const type = typeof cfg === 'object' ? (cfg.type ?? null) : cfg

  switch (type) {
    case String: return new StringField(model, name, cfg)
    case Number: return new NumberField(model, name, cfg)
    case Boolean: return new BooleanField(model, name, cfg)
    case BigInt: return new BigIntField(model, name, cfg)
    case Object: return new ObjectField(model, name, cfg)
    case Array: return new ArrayField(model, name, cfg)
    case Map: return new MapField(model, name, cfg)
    case Set: return new SetField(model, name, cfg)
    case Date: return new DateField(model, name, cfg)
    case RegExp: return new RegExpField(model, name, cfg)
  
    default: throw new TypeError(`Invalid Data Field configuration. Expected object or type, received "${type}"`)
  }
}

class DataField {
  #id = Symbol('datafield')
  #model
  #name
  #validateFn
  #value = null
  #default

  constructor (model, name, cfg) {
    this.#model = model
    this.#name = name
    this.#validateFn = cfg?.validate ?? null
    this.#default = cfg?.default ?? undefined
  }

  get defaultValue () {
    return this.#default
  }

  get id () {
    return this.#id
  }

  get isValid () {
    return this.#validateFn ? this.#validateFn(this.value) : true
  }

  get name () {
    return this.#name
  }

  get value () {
    return this.#value ?? this.#default ?? null
  }

  set value (to) {
    const from = this.value

    if (to === from) {
      return
    }

    this.#value = to

    const payload = {
      field: this.#name
    }
    
    this.#model.emit('field.change', {
      ...payload,
      from,
      to,
      revert: () => this.#value = from
    })
  }

  get validate () {
    return !!this.#validateFn
  }

  reset () {
    this.#value = null
    return this.#default ?? this.#value
  }
}

class StringField extends DataField {
  get type () {
    return String
  }

  get isValid () {
    let valid = super.isValid
    const { value } = this
    return valid && (value === null || typeof value === 'string')
  }
}

class NumberField extends DataField {
  get type () {
    return Number
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || !isNaN(this.value))
  }
}

class BooleanField extends DataField {
  get type () {
    return Boolean
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || typeof this.value === 'boolean')
  }
}

class BigIntField extends DataField {
  get type () {
    return BigInt
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || typeof this.value === 'bigint')
  }
}

class ObjectField extends DataField {
  get type () {
    return Object
  }

  get isValid () {
    let valid = super.isValid
    const { value } = this
    return valid && (value === null || typeof value === 'object' && !Array.isArray(value))
  }
}

class ArrayField extends DataField {
  get type () {
    return Array
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || Array.isArray(this.value))
  }
}

class MapField extends DataField {
  get type () {
    return Map
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || this.value instanceof Map)
  }
}

class SetField extends DataField {
  get type () {
    return Set
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || this.value instanceof Set)
  }
}

class DateField extends DataField {
  get type () {
    return Date
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || this.value instanceof Date)
  }
}

class RegExpField extends DataField {
  get type () {
    return RegExp
  }

  get isValid () {
    let valid = super.isValid
    return valid && (value === null || this.value instanceof RegExp)
  }
}