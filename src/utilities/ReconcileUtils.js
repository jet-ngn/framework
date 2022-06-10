function reconcileAttributes (original, update) {
  // console.log('REC ATTRIBUTES')
}

function reconcileElementNode (original, update) {
  if (original.constructor.name !== update.constructor.name) {
    original.replaceWith(update)
    return update
  }

  if (update.attributes.length > 0) {
    reconcileAttributes(original, update)
  } else {
    removeAllAttributes(original)
  }

  // console.log('REC EVENT LISTENERS')

  const { childNodes } = original

  if (childNodes.length > 0) {
    reconcileNodes(childNodes, update.childNodes)
  }

  return original
}

function reconcileNode (original, update) {
  switch (original.nodeType) {
    case 1: return reconcileElementNode(...arguments)
    case 3: return reconcileTextNode(...arguments)
    default: throw new TypeError(`Cannot reconcile node type "${original.nodeType}"`)
  }
}

export function reconcileNodes (original, update) {
  const result = []

  for (let i = 0, length = Math.max(original.length, update.length); i < length; i++) {
    const existingNode = original[i]
    const newNode = update[i]

    if (!existingNode) {
      if (!newNode) {
        break
      }

      result.at(-1).after(newNode)
      result.push(newNode)
      continue
    }

    if (!newNode) {
      existingNode.remove()
      continue
    }
    
    result.push(reconcileNode(existingNode, newNode))
  }

  return result
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