import { renderView, unmount } from './lib/rendering/Renderer'
import { PATH, TREE } from './env'
import View from '../src-OLD/View'

export default class Application {
  #rootNode
  #config
  #view
  #mounted = false

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  get baseURL () {
    return PATH.base.pathname
  }

  get view () {
    return this.#view
  }

  render () {
    const { view, mounted } = renderView(null, this.#rootNode, this.#config)
    this.#view = view
    this.#mounted = mounted

    if (PATH.remaining.length > 0) {
      console.log('REPLACE');
      const { lowestChild } = TREE
      const { parent, rootNode } = lowestChild

      // renderView()

      // rootNode.replaceChildren('404 Not Found')

      // const mounted = parent.children.reduce((result, { mounted, view }) => view === lowestChild ? mounted : result, false)

      // mounted && unmount(lowestChild)

      // console.log(new View(parent, rootNode, ));
      // rootNode.

      // parent.children.splice(TREE.lowestChild, 1, new View(parent, ))
      // console.log(`REPLACE`, TREE)
      // console.log('WITH 404');
    }

    return this
  }

  rerender () {
    this.#mounted && unmount(this.#view)
    return this.render()
  }
}

// function processIncludes ({ components, plugins }) {
//   components && components.forEach(({ install }) => install({ html, svg, createID }, Components))
//   // plugins && plugins.forEach(({ install }) => install({}, Plugins))
// }


