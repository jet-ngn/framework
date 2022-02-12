import EventManager from './EventManager.js'

const Entity = ({ name, selector, on }) => {
  if (!name) {
    throw new Error(`Entity configuration error: "name" attribute is required`)
  }

  const properties = {
    id: Symbol(),
    name,
    selector: selector ?? null
  }

  return {
    ...properties,
    ...EventManager(properties, on)
  }
}

export { Entity as default }