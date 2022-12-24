export const INTERNAL_ACCESS_KEY = Symbol()
export const RESERVED_EVENT_NAMES = ['abortMount', 'beforeMount', 'mount', 'unmount']

export const PATH = {
  base: null,
  current: null,
  previous: null,
  remaining: null
}

export const TREE = {
  rootView: null,
  deepestRoute: null
}

export const Plugins = {}