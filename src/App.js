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

  render (path) {
    this.root.replaceChildren(getViewContent(this, this.#cfg, {
      baseURL: this.#baseURL,
      path,
      retainFormatting: this.root.tagName === 'PRE'
    }).content)
  }
}