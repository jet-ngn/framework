import View from './View'
import EventRegistry from './registries/EventRegistry'
import { generateChildren, mount, unmount } from './utilities/RenderUtils'
import { PATH, Components } from './env'
import { html, svg } from './lib/tags'
import { createID } from './utilities/IDUtils'

function processIncludes ({ components, plugins }) {
  components && components.forEach(({ install }) => install({ html, svg, createID }, Components))
}

export default class Application extends View {
  constructor (root, { include }) {
    super(null, ...arguments, null, 'app')
    processIncludes(include ?? {})
  }

  get baseURL () {
    return PATH.base.pathname
  }

  run (config) {
    const { fragment } = generateChildren(this, arguments[0])
    this.root.replaceChildren(fragment)
    mount(this)
  }
}