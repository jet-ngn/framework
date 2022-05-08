import View from './View'
import { generateEntry, initializeView } from './utilities/ASTUtils'
import { matchPath } from './utilities/RouteUtils'

export default class App extends View {
  #baseURL
  #cfg

  constructor (root, cfg) {
    super(null, ...arguments, 'app')
    this.#baseURL = cfg.baseURL
    this.#cfg = cfg
  }

  render (path) {
    const ast = new Map([[this, generateEntry(this.#cfg, this.#baseURL)]])
    const { routes } = ast.get(this)

    if (!!routes) {
      const match = matchPath(path, routes)

      if (match) {
        return console.log('HANDLE MATCH')
      }
    }

    const content = initializeView(this, this.#cfg, baseURL, )

    // if (!!data.routes) {
    //   const match = matchPath(path, data.routes)
      
    //   if (match) {
    //     // const 
    //   }
    // }

    // this.root.replaceChildren(content)
  }
}

// TODO:

// For every level of the AST:
// 1. Check if there is a path
// 2. If there is, parse routes
// 3. If there are routes, 
// 1. Parse routes
// 2. If there are routes, check against path, if there is one
// 3. If there is an exactly-matching route, render it and END
// 4. If there is not, check for template
// 5. If there is a tem
