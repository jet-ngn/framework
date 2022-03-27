export function reconcileNode (original, update) {
  const types = {
    original: original.constructor.name,
    update: update.constructor.name
  }

  if (types.original !== types.update) {
    original.replaceWith(update)
    return update
  }

  switch (types.original) {
    case 'Text': return reconcileTextNode(original, update)
    
    default: return reconcileElementNode({
      type: types.original,
      node: original
    }, {
      type: types.update,
      node: update
    })
  }
}

function reconcileAttributes (original, update) {
  console.log('REC ATTRIBUTES')
}

function removeAllAttributes (node) {
  const { attributes } = node

  while (attributes.length > 0) {
    node.removeAttribute(attributes[0].name)
  }
}

function reconcileElementNode (original, update) {
  if (original.type !== update.type) {
    // TODO: Cleanup event listeners
    original.replaceWith(update)
    return update
  }

  if (update.node.attributes.length > 0) {
    reconcileAttributes(original.node, update.node)
  } else {
    removeAllAttributes(original.node)
  }

  console.log('REC EVENT LISTENERS')

  const { childNodes } = original.node

  if (childNodes.length > 0) {
    reconcileNodes(childNodes, update.node.childNodes)
  }

  return original
}

function reconcileTextNode (original, update) {
  if (update.data !== original.data) {
    original.data = update.data
  }

  return original
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

      // TODO: Add event listeners
      // TODO: Add task: insert after original.at(-1)
      // original.at(-1).after(newNode)
      // original.push(newNode)
      // result.push(newNode)
      continue
    }

    if (!newNode) {
      // TODO: Cleanup event listeners
      // TODO: Add task: remove existingNode
      // existingNode.remove()
      // original.splice(i, 1)
      continue
    }

    result.push(reconcileNode(existingNode,  newNode))
  }

  return result
}