import Parser from './Parser'
import Route from './Route'
import View from './View'

let tree

export default class App extends View {
  #root
  #baseURL

  constructor (root, config) {
    super(null, ...arguments)

    this.#root = root
    this.#baseURL = config.baseURL
    
    const { routes } = config
    const template = Reflect.get(config, 'template', this)
    const parser = new Parser(this)
    const content = parser.parse(template)

    tree = {
      content,
      templates: parser.templates,
      trackers: parser.trackers,
      routes: Object.keys(routes ?? {}).reduce((result, route) => {
        result = result ?? {}
        const config = routes[route]
        route = route.trim()
        result[route] = new Route(new URL(route, this.#baseURL), config)
        return result
      }, null)
    }
  }

  render () {
    
  }
}