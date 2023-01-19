import DataBinding from './DataBinding'
import PermissionsManager from '../../session/PermissionsManager'
import { ViewPermissions } from '../../rendering/View'

export default class DataBindingTaskGenerator extends DataBinding {
  * getReconciliationTasks (init, generator) {
    const previous = this.value
    let args = []

    if (this.proxies.size === 1) {
      const [proxy, properties] = [...this.proxies][0]
      
      if (properties.length === 0) {
        args.push(proxy)
      } else {
        args.push(...properties.map(property => proxy[property]))
      }
    } else {
      for (const [proxy, properties] of this.proxies) {
        if (proxy instanceof ViewPermissions) {
          args.push(new PermissionsManager(proxy))
        } else if (properties.length === 0) {
          args.push(proxy)
        // } else if (properties.length === 1) {
        //   args.push(proxy[properties[0]])
        } else {
          args.push(properties.reduce((result, property) => ({ ...result, [property]: proxy[property] }), {}))
        }
      }
    }

    let result = this.transform(...args)

    if (result !== previous) {
      this.value = result ?? null

      yield * generator(init, {
        previous,
        current: this.value
      }) 
    }
  }
}