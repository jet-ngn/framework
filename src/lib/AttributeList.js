import AttributeListBinding from './data/bindings/AttributeListBinding'
import AttributeListBooleanBinding from "./data/bindings/AttributeListBooleanBinding"
import DataBindingInterpolation from './data/DataBindingInterpolation'
import { logBindings, registerBinding, removeBinding } from './data/DataRegistry'

export default class AttributeList {
  #app
  #bindings = []
  #view
  #element
  #name
  #list
  #dummy = document.createElement('template')

  constructor (app, view, element, name, list) {
    this.#app = app
    this.#view = view
    this.#element = element
    this.#name = name
    this.#list = this.#processList(list)
  }

  get app () {
    return this.#app
  }

  get dummy () {
    return this.#dummy
  }

  get element () {
    return this.#element
  }

  get name () {
    return this.#name
  }

  get view () {
    return this.#view
  }

  update (list) {
    this.#bindings.forEach(removeBinding)
    this.#bindings = []
    this.#list = this.#processList(list)
  }

  * getReconciliationTasks ({ init = false } = {}) {
    if (init) {
      yield [`Apply "${this.#name}" attribute list`, ({ next }) => {
        this.#element.setAttribute(this.#name, this.#list.join(' '))
        next()
      }]
    }

    for (const binding of this.#bindings) {
      yield * binding.getReconciliationTasks({ init })
    }
  }

  #processList (list) {
    return list.reduce((result, entry) => {
      if (entry instanceof DataBindingInterpolation) {
        this.#bindings.push(registerBinding(new AttributeListBinding(this, entry)))
        return result
      }

      switch (typeof entry) {
        case 'string':
        case 'number': return [...result, `${entry}`].filter(Boolean)
        case 'object': return [...result, ...this.processObject(entry)]
        default: throw new TypeError(`Invalid list() argument type "${typeof entry}"`)
      }
    }, [])
  }

  processObject (obj, nested = false) {
    return Object.keys(obj).reduce((result, name) => {
      const value = obj[name]

      if (value instanceof DataBindingInterpolation) {
        if (nested) {
          throw new Error(`Attribute bindings cannot have additional bindings nested inside`)
        }

        this.#bindings.push(registerBinding(new AttributeListBooleanBinding(this, name, value)))
        return result
      }
      
      if (typeof value !== 'boolean') {
        throw new TypeError(`Invalid conditional attribute list entry. Expected "boolean" but received "${typeof value}"`)
      }
      
      value === true && result.push(name)
      return result
    }, [])
  }
}