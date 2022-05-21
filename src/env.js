export const INTERNAL_ACCESS_KEY = Symbol()

export const PATH = class {
  static base = null
  static current = null
  static previous = null
  static remaining = null
  static has404 = false
}

export const Components = {}