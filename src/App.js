import View from './View'
import { getViewContent } from './Renderer'

export default class App extends View {
  #baseURL
  #cfg

  constructor (root, cfg) {
    super(null, ...arguments, 'app')
    this.#baseURL = cfg.baseURL
    this.#cfg = cfg
  }

  render (path, previous = null) {
    this.root.replaceChildren(getViewContent(this, this.#cfg, {
      baseURL: this.#baseURL,
      path,
      previous,
      retainFormatting: this.root.tagName === 'PRE'
    }).content)
  }
}