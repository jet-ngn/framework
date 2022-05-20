import View from './View'
import { generateChildren, mount, unmount } from './utilities/RenderUtils'
import { PATH, Components } from './env'

import { html, svg } from './lib/tags'
import { createID } from './utilities/IDUtils'

function processIncludes ({ components, plugins }) {
  components && components.forEach(({ install }) => install({ html, svg, createID }, Components))
}

export default class Application extends View {
  #include

  constructor (root, { include }) {
    super(null, ...arguments, null, 'app')
    this.#include = processIncludes(include ?? {})
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