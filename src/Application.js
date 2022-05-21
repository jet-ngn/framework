import Entity from './Entity'
// import { generateTree, mount, unmount } from './utilities/RenderUtils'
import { PATH, Components } from './env'
import { html, svg } from './lib/tags'
import { createID } from './utilities/IDUtils'

function processIncludes ({ components, plugins }) {
  components && components.forEach(({ install }) => install({ html, svg, createID }, Components))
}

export default class Application extends Entity {
  constructor (rootNode, { include }) {
    super(null, rootNode, arguments[1], 'app')
    processIncludes(include ?? {})
  }

  get baseURL () {
    return PATH.base.pathname
  }

  // run (config) {
  //   const { fragment } = generateTree(this, arguments[0])
  //   this.root.replaceChildren(fragment)
  //   mount(this)
  // }
}