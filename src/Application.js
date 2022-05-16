import View from './View'
import { generateChildren, mount, unmount } from './utilities/RenderUtils'
import { PATH } from './env'

export default class Application extends View {
  constructor (root, config) {
    super(null, ...arguments, null, 'app')
  }

  get baseURL () {
    return PATH.base.pathname
  }

  reconcile (config) {
    unmount(this)
    this.run(config)
  }

  run (config) {
    const { fragment } = generateChildren(this, config)
    this.root.replaceChildren(fragment)
    mount(this)
  }
}