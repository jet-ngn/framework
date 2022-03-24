import Constants from '../Constants.js'

export function processList (items) {
  return items.reduce((result, item) => {
    result.push(...processListItem(item))
    return result
  }, [])
}

function processListItem (item) {
  switch (typeof item) {
    case 'string':
    case 'number': return [`${item}`]
    case 'object': return processObject(item)
    default: throw new TypeError(`Invalid list() argument type "${typeof item}"`)
  }
}

function processObject (obj) {
  if (Array.isArray(obj)) {
    throw new TypeError(`Invalid list() argument type "array"`)
  }

  if (obj.type === Constants.Tracker) {
    return [obj]
  }

  return Object.keys(obj).reduce((result, name) => {
    const value = obj[name]

    if (value === true) {
      result.push(name)
    }

    if (value.type === Constants.Tracker) {
      result.push({ ...value, value: name })
    }

    return result
  }, [])
}