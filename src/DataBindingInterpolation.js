import IdentifiedClass from './IdentifiedClass'

export default class DataBindingInterpolation extends IdentifiedClass {
  #targets
  #properties
  #transform = (value => value)

  constructor ({ targets, properties, transform }) {
    super('data-binding')

    if (Array.isArray(targets)) {
      this.#targets = targets
      this.#properties = null
      this.#transform = properties ?? this.#transform
    } else {
      this.#targets = [targets]
      this.#properties = Array.isArray(properties) ? properties : [properties]
      this.#transform = transform ?? this.#transform
    }
  }

  get targets () {
    return this.#targets
  }

  get properties () {
    return this.#properties
  }

  get transform () {
    return this.#transform
  }
}