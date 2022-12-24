import { removeDOMEventsByNode } from '../events/DOMBus'
import { escapeString } from '../../utilities/StringUtils'
import RouteManager from '../routing/RouteManager'
import { PATH } from '../../env'
import { getViewInitializationTasks, getViewRenderingTasks, unmountView } from './Renderer'
import Route from '../routing/Route'

function getViewChildMatchTasks (view, remainingPath) {
  PATH.remaining = remainingPath
  const { routes } = view.config

  const { matched } = new RouteManager(Object.keys(routes).reduce((result, route) => ({
    ...result,
    [`${parent.route?.path ?? ''}${route}`]: routes[route]
  }), {}))

  if (!!matched) {
    return getViewInitializationTasks({
      parent: view,
      rootNode: view.rootNode,
      config: matched.config,
      route: new Route(matched)
    }, { setDeepestRoute: true })
  }

  console.log(`No Route matched "${PATH.current}". Render 404`)
}

function getViewMatchTasks (view, remainingPath) {
  const tasks = []
  const { name, parent } = view

  if (!!view.route) {
    let { matched } = new RouteManager({ [`${parent.route?.path ?? ''}${view.route.path}`]: view.config })

    if (!!matched) {
      return getViewRenderingTasks(view, { setDeepestRoute: true })
    }

    if (!!parent) {
      tasks.push({
        name: `Unmount "${name}"`,
        meta: { view },
        callback: async () => {
          unmountView(view)
          view.parent?.children.delete(view)
        }
      })
    }
  }

  return !!parent ? [...tasks, ...getViewReconciliationTasks(parent)] : getViewRenderingTasks(view, { setDeepestRoute: true })
}

export function getViewReconciliationTasks (view) {
  const { remaining } = PATH,
        { routes } = view.config

  let { matched } = new RouteManager(Object.keys(routes ?? {}).reduce((result, route) => ({
    ...result,
    [`${view.route?.path ?? ''}${route}`]: routes[route]
  }), {}))

  return !!matched ? getViewChildMatchTasks(view, remaining) : getViewMatchTasks(view, remaining)
}

export function reconcileNodes (original, update) {
  const result = []

  for (let i = 0, length = Math.max(original.length, update.length); i < length; i++) {
    const existingNode = original[i],
          newNode = update[i]

    if (!existingNode) {
      if (!newNode) {
        break
      }

      result.at(-1).after(newNode)
      result.push(newNode)
      continue
    }

    if (!newNode) {
      removeDOMEventsByNode(existingNode)
      existingNode.remove()
      continue
    }

    result.push(reconcileNode(existingNode, newNode))
  }

  return result
}

function getAttributes (element) {
  return [...element.attributes].reduce((result, attr) => {
    result[attr.name] = attr.value === '' ? true : attr.value
    return result
  }, {})
}

function reconcileAttribute (element, name, { current, update }) {
  if (update === current) {
    return
  }

  if (!update) {
    return element.removeAttribute(name)
  }

  setAttribute(element, name, update)
}

function reconcileAttributes (original, update) {
  const attributes = {
    current: getAttributes(original),
    update: getAttributes(update)
  }

  if (attributes.current.length === 0) {
    return get.forEach(name => setAttribute(original, name, attributes.update[name]))
  }

  Object.keys({ ...attributes.current, ...attributes.update }).forEach(attribute => {
    const change = {
      current: attributes.current[attribute],
      update: attributes.update[attribute]
    }

    if (change.update) {
      if (change.current) {
        return reconcileAttribute(original, attribute, change)
      }
      
      return setAttribute(original, attribute, change.update)
    }

    original.removeAttribute(attribute)
  })
}

function reconcileNode (original, update) {
  switch (original.nodeType) {
    case 1: return reconcileElementNode(...arguments)
    case 3: return reconcileTextNode(...arguments)
    default: throw new TypeError(`Cannot reconcile node type "${original.nodeType}"`)
  }
}

function reconcileElementNode (original, update) {
  if (original.constructor.name !== update.constructor.name) {
    removeDOMEventsByNode(original)
    original.replaceWith(update)
    return update
  }

  removeDOMEventsByNode(update)

  if (update.attributes.length > 0) {
    reconcileAttributes(original, update)
  } else {
    removeAllAttributes(original)
  }

  const { childNodes } = original

  if (childNodes.length > 0) {
    reconcileNodes(childNodes, update.childNodes)
  }

  return original
}

function reconcileTextNode (original, update) {
  if (update.data !== original.data) {
    original.data = update.data
  }

  return original
}

function removeAllAttributes (node) {
  const { attributes } = node

  while (attributes.length > 0) {
    node.removeAttribute(attributes[0].name)
  }
}

function setAttribute (element, name, value) {
  if (!name.startsWith('data-') && typeof value === 'boolean') {
    return value ? element.setAttribute(name, '') : element.removeAttribute(name)
  }

  element.setAttribute(name, escapeString(value))
}