import Constants from './Constants.js'

function validateSelectors (selectors = {}) {
  const keys = Object.keys(selectors)

  if (keys.length === 0) {
    return null
  }

  let i = 0, length = keys.length, name, selector

  while (i < length) {
    name = keys[i]

    if (Constants.REF_RESERVEDNAMES.includes(name)) {
      throw new Error(`Invalid reference: "${name}" is a reserved word`)
    }

    selectors[name] = selectors[name].trim()

    // if (selector.startsWith('>')) {
    //   selectors[name] = `:scope ${selector}`
    // }

    // if (!(node instanceof ParsedNode) && typeof node !== 'string') {
    //   throw new Error(`Invalid reference "${name}". Expected a ParsedNode or a selector string but received ${NGN.typeof(node)}`)
    // }

    i++
  }

  return selectors
}

export default class ReferenceManager {
  #context
  #selectors
  #root

  constructor (context, selectors, root) {
    this.#context = context
    this.#selectors = validateSelectors(selectors)
    // this.#root = root ?? null

    // if (!this.#root) {
    //   throw new Error(`Invalid ${context.constructor.name} "${context.name}" configuration. "selector" property is required`)
    // }
  }

  get selectors () {
    return this.#selectors
  }

  // get root () {
  //   return 'TODO'
  // }
}