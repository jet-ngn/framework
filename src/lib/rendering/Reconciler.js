import Route from '../routing/Route'
import { removeDOMEventsByNode } from '../events/DOMBus'
import { escapeString } from '../../utilities/StringUtils'
import { getMatchingRoute } from '../routing/utilities'
import { INTERNAL_ACCESS_KEY, PATH } from '../../env'

import {
  getViewInitializationTasks,
  getViewRenderingTasks,
  getViewRoutingTasks,
  unmountView
} from './Renderer'

export function getViewReconciliationTasks (view) {
  console.log(view.name);
  const { config, name, parent, route } = view
  const { routes } = config
  let match = null

  if (!!routes) {
    match = getMatchingRoute(routes, {
      base: route?.path,
      exact: true
    })

    if (match) {
      console.log(`"${name}" child route "${match.config.name}" matched "${PATH.current}". Render it.`)
      return getViewInitializationTasks({
        parent: view,
        rootNode: view.rootNode,
        config: match.config,
        route: new Route(parent, match)
      },{ setDeepestRoute: true })
    }
  }
  
  match = getMatchingRoute({ [route.path]: config }, { exact: true })

  if (match) {
    console.log(`"${name}" route matched "${PATH.current}"`)

    if (view.mounted) {
      console.log('...and it is already mounted. Re-render it.')
      return [{
        name: `Update "${name}" route`,
        callback: () => view.emit(INTERNAL_ACCESS_KEY, 'reconcile')
      }, ...getViewRenderingTasks(view, { setDeepestRoute: true })]
    } else {
      console.log('...and it is not yet rendered. Render it.')
      return getViewRenderingTasks(view, { setDeepestRoute: true })
    }
  }

  console.log(`"${name}" route did not match "${PATH.current}". Try parent`)

  const tasks = [{
    name: `Unmount "${name}"`,

    callback: async () => {
      await unmountView(view)
      parent?.children.delete(view)
    }
  }]

  if (!!parent) {
    return [...tasks, ...getViewReconciliationTasks(parent)]
  }

  console.log(`"${name}" does not have a parent. This is the top level, so re-render the whole app.`)
  const options = { setDeepestRoute: true }

  return [...tasks, ...(!!routes ? getViewRoutingTasks(view, options) : getViewRenderingTasks(view, options))]
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