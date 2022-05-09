import View from './View'
import Renderer from './Renderer'
import Route from './Route'
import DefaultRoutes from './lib/routes'
import { renderView } from './Renderer'
import { generateASTEntry } from './utilities/ASTUtils'
import { matchPath } from './utilities/RouteUtils'

const ast = new Map

function generateRoutes (routes, baseURL) {
  return Object.keys(routes ?? {}).reduce((result, route) => {
    if (!result) {
      result = {}
    }

    const config = routes[route]
    route = route.trim()
    result[route] = new Route(new URL(route, baseURL), config)
    return result
  }, null)
}

export function getViewContent (view, cfg, { baseURL, path, retainFormatting }) {
  console.log('RENDER', view.name, path);
  const renderer = new Renderer(view, retainFormatting)
  let content
  const routes = generateRoutes(cfg.routes, baseURL)

  if (routes) {
    const { route, remaining } = matchPath(path, routes)
    path = remaining ?? path

    if (route) {
      const { config } = route
      content = getViewContent(new View(view, view.root, config), config, { baseURL, path, retainFormatting })
    }
  }

  if (!content) {
    if (path.length > 1) {
      template = !!routes?.[404]
        ? Reflect.get(routes[404], 'template', view)
        : Reflect.get(DefaultRoutes[404], 'template', view)
    } else {
      template = Reflect.get(cfg, 'template', view)

      if (!template) {
        template = !!routes?.[404]
          ? Reflect.get(routes[404], 'template', view)
          : Reflect.get(DefaultRoutes[404], 'template', view)
      }
    }

    content = renderer.render(template, path, baseURL)
  }

  return content
}

export default class App extends View {
  #baseURL
  #cfg

  constructor (root, cfg) {
    super(null, ...arguments, 'app')
    this.#baseURL = cfg.baseURL
    this.#cfg = cfg
  }

  render (path) {
    const content = getViewContent(this, this.#cfg, {
      baseURL: this.#baseURL,
      path,
      retainFormatting: this.root.tagName === 'PRE'
    })

    this.root.replaceChildren(content)

    // ast.set(this, {
    //   children: this.#generateChildren(Reflect.get(this.#cfg, 'template', this) ?? html``),
    //   routes: this.#generateRoutes(this.#cfg.routes)
    // })

    // console.log(ast);
  }
}



// initializeView(this, this.#cfg, this.#baseURL, path)
//     console.log(ast);

// content = renderView(view, (!path || path === '/') ? config : config.routes?.[404] ?? DefaultRoutes[404], baseURL, data)

// function initializeView (view, config, baseURL, path) {
//   console.log('INIT', view.name);
//   ast = new Map([[view, generateASTEntry(config.routes, baseURL)]])
//   const data = ast.get(view)
//   let content = renderView(view, path === '/' ? config : config.routes?.[404] ?? DefaultRoutes[404], baseURL, data)

//   // if (!!data.routes) {
//   //   const match = matchPath(path, data)
//   //   content = renderView(view, match.config, baseURL, data)
//   // }

//   view.root.replaceChildren(content)
//   // const match = matchPath(path, data)

//   // console.log(match);
// }

// if (!!routes) {
//   console.log('HAS ROUTES. CHECK FOR MATCH')

//   const match = matchPath(path, routes)
//   console.log(match);
//   if (match) {
//     console.log('FOUND EXACT ');
//   }

//   return
// }

// const { routes } = ast.get(this)

    // if (!!routes) {
    //   const match = matchPath(path, routes)

    //   if (match) {
    //     return console.log('HANDLE MATCH')
    //   }
    // }

    // const content = initializeView(this, this.#cfg, baseURL, )

    // if (!!data.routes) {
    //   const match = matchPath(path, data.routes)
      
    //   if (match) {
    //     // const 
    //   }
    // }

    // this.root.replaceChildren(content)