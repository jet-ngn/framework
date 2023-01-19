import AttributeListBinding from './data/bindings/AttributeListBinding'
import AttributeListBooleanBinding from "./data/bindings/AttributeListBooleanBinding"
import DataBindingInterpolation from './data/DataBindingInterpolation'
import { registerBinding, removeBinding } from './data/DataRegistry'
import { runTasks } from './TaskRunner'

export default class AttributeList {
  #app
  #bindings = new Set
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

  async reconcile (init = false) {
    this.#element.setAttribute(this.#name, [...this.#list].join(' '))
    this.#bindings.size > 0 && runTasks(this.#getBindingUpdateTask(init))
  }

  update (list) {
    this.#bindings.forEach(removeBinding)
    this.#bindings = []
    this.#list = this.#processList(list)
  }

  * #getBindingUpdateTask (init) {
    yield [`Reconcile Attribute List Bindings`, async ({ next }) => {
      await Promise.allSettled([...this.#bindings].map(async binding => {
        await binding.reconcile(init)
      }))

      next()
    }]
  }

  #processList (list) {
    return list.reduce((result, entry) => {
      if (entry instanceof DataBindingInterpolation) {
        this.#bindings.add(registerBinding(new AttributeListBinding(this, entry)))
        return result
      }

      switch (typeof entry) {
        case 'string':
        case 'number':
          entry = `${entry.trim()}`
          return entry !== '' ? result.add(`${entry.trim()}`) : result

        case 'object': return this.processObject(entry).reduce((result, entry) => result.add(entry), result)
        
        default: throw new TypeError(`Invalid list() argument type "${typeof entry}"`)
      }
    }, new Set)
  }

  processObject (obj, nested = false) {
    return Object.keys(obj).reduce((result, name) => {
      const value = obj[name]

      if (value instanceof DataBindingInterpolation) {
        if (nested) {
          throw new Error(`Attribute bindings cannot have additional bindings nested inside`)
        }

        this.#bindings.add(registerBinding(new AttributeListBooleanBinding(this, name, value)))
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