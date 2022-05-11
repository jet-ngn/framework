import View from './View'
import EventRegistry from './registries/EventRegistry'
import { getViewContent } from './Renderer'

export default class App extends View {
  #baseURL
  #cfg
  #rendered = false

  constructor (root, cfg) {
    super(null, ...arguments, 'app')
    this.#baseURL = cfg.baseURL
    this.#cfg = cfg
  }

  render (path, previous = null) {
    if (this.#rendered) {
      EventRegistry.removeAll({
        ignore: [this]
      })
    }

    let tasks = []

    const { content } = getViewContent(this, this.#cfg, {
      baseURL: this.#baseURL,
      path,
      previous,
      retainFormatting: this.root.tagName === 'PRE'
    }, tasks)

    this.root.replaceChildren(content)
    tasks.forEach(task => task())
    this.#rendered = true
  }
}