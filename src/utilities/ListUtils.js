import { typeOf } from '@ngnjs/libdata'
import { Tracker } from '../registries/ObservableRegistry.js'

export function processList (items) {
  return items.reduce((result, item) => {
    result.push(...processListItem(item))
    return result
  }, [])
}

function processListItem (item) {
  const type = typeOf(item)

  switch (type) {
    case 'string':
    case 'number': return [`${item}`]
    case 'object': return processObject(item)
    default: throw new TypeError(`Invalid list() argument type "${typeof item}"`)
  }
}

function processObject (obj) {
  if (obj instanceof Tracker) {
    return getTrackedValue(obj)
  }

  return Object.keys(obj).reduce((result, name) => {
    const value = obj[name]

    if (value === true) {
      result.push(name)
    }

    if (value instanceof Tracker) {
      const output = getTrackedValue(value, name)
      result.push(...output)
    }

    return result
  }, [])
}

function getTrackedValue (tracker, booleanOutput) {
  const { output } = tracker
  const type = typeOf(output)

  switch (type) {
    case 'string':
    case 'number': return [output]

    case 'array': return [...output]

    case 'boolean': return Array.isArray(booleanOutput) ? [...booleanOutput] : [booleanOutput]
  
    default: throw new TypeError(`Invalid tracked value type "${type}"`)
  }
}