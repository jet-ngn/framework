import DataBindingInterpolation from './DataBindingInterpolation'
import { getStateByProxy } from './DataRegistry'

export function bind (...args) {
  let properties = args[1]
  let transform = args[2] ?? null

  if (typeof properties === 'function') {
    transform = properties
    properties = []
  }

  return new DataBindingInterpolation({
    proxies: new Map([[args[0], Array.isArray(properties) ? properties : [properties]]]),
    transform: transform ?? (data => data)
  })
}

export function bindAll (...args) {
  const transform = args.pop()

  return new DataBindingInterpolation({
    proxies: new Map([...args.reduce((result, [proxy, ...props]) => [...result, [proxy, props]], [])]),
    transform
  })
}

export function clear (proxy) {
  getStateByProxy(proxy)?.clear()
}

export function load (proxy, data) {
  getStateByProxy(proxy)?.load(data)
}

export function onChange (proxy, ...args) {
  getStateByProxy(proxy)?.registerChangeHandler(...args)
}

export function update (proxy, data) {
  getStateByProxy(proxy)?.update(data)
}

export { default as State } from './StateFactory'