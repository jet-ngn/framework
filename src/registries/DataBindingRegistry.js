class DataBindingRegistry {
  #bindings = {
    attributes: new Map,
    classNames: new Map,
    interpolations: new Map
  }

  #deferredBindings = {
    attributes: new Map,
    classNames: new Map,
    interpolations: new Map
  }

  get bindings () {
    return this.#bindings
  }

  get deferredBindings () {
    return this.#deferredBindings
  }

  registerAttributeBinding ({ model, field, element, attribute, process, defer }) {
    return this.#bind({
      collection: 'attributes',
      model,
      data: {
        field,
        element,
        attribute,
        process: process ?? null
      }
    })
  }

  registerClassNameBinding = ({ model, field, element, className, process, defer = false }) => {
    return this.#bind({
      collection: 'classNames',
      model,
      data: {
        field,
        element,
        className,
        process
      }
    })
  }

  registerInterpolationBinding = ({ model, field, interpolation, process, defer = false }) => {
    return this.#bind({
      collection: 'interpolations',
      model,
      data: {
        field,
        interpolation,
        process
      }
    })
  }

  #applyBindingListener = model => {
    model.on('field.update', change => {
      const attributeBindings = this.#bindings.attributes.get(model)

      if (!!attributeBindings) {
        attributeBindings.forEach(({ field, attribute, element, process }) => {
          this.#handleUpdate(field, change, () => {
            element.setAttribute(attribute, process ? process(field ? change.new : model.data) : change.new)
          })
        })
      }

      const classNameBindings = this.#bindings.classNames.get(model)

      if (!!classNameBindings) {
        classNameBindings.forEach(({ field, className, element, process }) => {
          this.#handleUpdate(field, change, () => {
            element.classList.toggle(className, field ? change.new : process(model.data))
          })
        })
      }

      const interpolationBindings = this.#bindings.interpolations.get(model)

      if (!!interpolationBindings) {
        interpolationBindings.forEach(({ field, interpolation, process }) => {
          this.#handleUpdate(field, change, () => {
            interpolation.update(process ? process(field ? change.new : model.data) : change.new)
          })
        })
      }
    })
  }

  #bind = ({ collection, model, field, data }) => {
    collection = this.#bindings[collection]

    if (collection.has(model)) {
      collection.set(model, [...collection.get(model), data])
    } else {
      collection.set(model, [data])
      this.#applyBindingListener(model)
    }
  }

  #handleUpdate = (field, change, cb) => {
    if (!field) {
      return cb()
    }

    if (field !== change.field || change.new === change.old) {
      return
    }

    cb()
  }
}

export default new DataBindingRegistry()