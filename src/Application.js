import { getViewInitializationTasks, getViewRoutingTasks, unmountView } from './lib/rendering/Renderer'
import { getMatchingRoute } from './lib/routing/utilities'
import { Plugins, TREE, PATH, APP } from './env'

async function runTasks (tasks) {
  for (let { callback, name } of tasks) {
    let stop = false
    await callback(() => stop = true)

    if (stop) {
      break
    }
  }
}

export default class Application {
  #config
  #rootNode

  constructor (rootNode, config) {
    this.#rootNode = rootNode
    this.#config = config
    config.plugins?.forEach(({ install }) => install(Plugins))
  }

  async render () {
    TREE.length = 0

    const tasks = getViewInitializationTasks({
      rootNode: this.#rootNode,
      config: this.#config
    }, { setDeepestRoute: true, addToTree: true })
    
    await runTasks(tasks)
  }

  async reconcile () {
    const trash = []
    const matches = []
    const initial = PATH.remaining
    const remaining = []

    for (const [i, view] of TREE.entries()) {
      if (view === APP.rootView) {
        matches.push(view)
        continue
      }

      const match = getMatchingRoute(view.config.routes)

      if (!!match) {
        matches.push(view)
        remaining.push(PATH.remaining)
      } else {
        trash.push(view)
      }

      if (PATH.remaining.length === 0) {
        trash.push(...TREE.slice(i + 1))
        break
      }
    }

    TREE.length = 0
    TREE.push(...matches)
    
    if (PATH.remaining.length === 0) {
      PATH.remaining = remaining.at(-2) ?? initial
    }

    const tasks = [...trash.map(view => ({
      name: `Unmount "${view.name}"`,
      callback: async () => await unmountView(view)
    })), ...getViewRoutingTasks(TREE.at(-1), { setDeepestRoute: true, addToTree: true })]

    await runTasks(tasks)
  } 
}