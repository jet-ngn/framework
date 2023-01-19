import PluginManager from './lib/PluginManager'

export const INTERNAL_ACCESS_KEY = Symbol('INTERNAL_ACCESS_KEY')
export const RESERVED_EVENT_NAMES = ['abortMount', 'beforeMount', 'mount', 'unmount', 'remount', 'render']

export const Path = {
  base: '/',
  vars: null
}

export const Plugins = new PluginManager