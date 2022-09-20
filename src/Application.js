import { generateRenderingTasks, processTemplate, unmountView } from './lib/rendering/Renderer'
import { INTERNAL_ACCESS_KEY, PATH, RENDERER, TREE } from './env'

import View from './View'
import Route from './lib/routing/Route.js'
import NotFound from './lib/views/404.js'

export default class Application {
  #config
  #rootNode
  #view

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
  }

  render () {
    this.#view = generateRenderingTasks(null, this.#rootNode, this.#config, null, true)
    runTasks(getRenderer()())

    RENDERER.mountableViews.forEach(view => view.emit(INTERNAL_ACCESS_KEY, 'mount'))
    RENDERER.tasks = []
    RENDERER.viewBeforeMountEventsFired = new Map
  }

  rerender () {
    unmountView(this.#view)
    this.render()
  }
}

function getRenderer () {
  return function* () {
    for (let { view, callback } of RENDERER.tasks) {
      if (PATH.remaining.length > 0 && view === TREE.lowestChild) {
        view = new View(view.parent, view.rootNode, NotFound, new Route({ url: new URL(PATH.current, PATH.base) }))

        yield renderView(view, function () {
          RENDERER.tasks = []
          RENDERER.mountableViews = []
          processTemplate(view, view.rootNode, NotFound.render.call(view))
          TREE.lowestChild = null
          runTasks(getRenderer()(), true)
        })

        break
      }

      yield renderView(view, callback)
    }
  }
}

function renderView (view, renderFn) {
  let shouldMount = true
  let retry = false

  if (!RENDERER.viewBeforeMountEventsFired.get(view)) {
    view.emit(INTERNAL_ACCESS_KEY, 'beforeMount', {
      abort: () => shouldMount = false
    })
  
    RENDERER.viewBeforeMountEventsFired.set(view, true)
  }

  if (!shouldMount) {
    view.emit(INTERNAL_ACCESS_KEY, 'abortMount', {
      resume: () => shouldMount = true,

      retry: () => {
        retry = true
        RENDERER.viewBeforeMountEventsFired.set(view, false)
      }
    })
    
    if (retry) {
      return renderView(...arguments)
    }
  }

  renderFn()
  !RENDERER.mountableViews.includes(view) && RENDERER.mountableViews.unshift(view)

  return view
}

function runTasks (iterator) {
  const { value, done } = iterator.next()

  if (done || !RENDERER.mountableViews.includes(value)) {
    return
  }

  runTasks(...arguments)
}

// function processIncludes ({ components, plugins }) {
//   components && components.forEach(({ install }) => install({ html, svg, createID }, Components))
//   // plugins && plugins.forEach(({ install }) => install({}, Plugins))
// }