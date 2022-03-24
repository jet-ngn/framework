import Constants from '../Constants.js'

// render (node, trackerRegistry, separator = ' ') {
//   return this.#items.reduce((result, item) => {
//     result.push(...this.#processItem(node, trackerRegistry, item))
//     return result
//   }, []).join(separator)
// }



// return this.#items.reduce((result, item) => {
//   result.push(...this.#processItem(node, trackerRegistry, item))
//   return result
// }, []).join(separator)

export default class ListRegistry {
  #context
  #lists = {}

  constructor (context) {
    this.#context = context
  }

  // register (node, items, { trackerRegistry }) {
  //   return items.map(item => this.#processListItem(item, { node, trackerRegistry })).join(' ')
  // }

  // #processListItem (item, cfg) {
  //   switch (typeof item) {
  //     case 'string':
  //     case 'number': return [`${item}`]
  //     case 'object': return this.#processObject(item, cfg)
  //     default: throw new TypeError(`Invalid list() argument type "${typeof item}"`)
  //   }
  // }

  // #processObject (obj, { node, trackerRegistry }) {
  //   if (Array.isArray(obj)) {
  //     throw new TypeError(`Invalid list() argument type "array"`)
  //   }
  
  //   return Object.keys(obj).reduce((result, name) => {
  //     const value = obj[name]
  
  //     if (value === true) {
  //       result.push(name)
  //     }
  
  //     if (value.type === Constants.Tracker) {
  //       const tracker = trackerRegistry.registerAttributeListTracker(node, value)
  //       result.push(tracker.value)
  //     }
  
  //     return result
  //   }, [])
  // }
}