import DOMEventListener from '../DOMEventListener'

const listeners = new Map

function applyListeners (eventName) {
  return document.body.addEventListener(eventName, evt => {
    const { target } = evt

    ;[...listeners.values()]
      .filter(({ node, event }) => (target === node || node.contains(target)) && event === eventName)
      .forEach(({ view, handler }) => handler.call(view, evt))
  })
}

export function addDOMEventHandler (view, node, event, callback, options) {
  const shouldApplyListeners = ![...listeners.keys()].some(({ event }) => event === name)
  const listener = new DOMEventListener(...arguments)

  listeners.set({
    view,
    event,
    id: listener.id,
    node,
    handler: listener.handler.id
  }, listener)

  if (['blur', 'focus'].includes(event)) {
    return node.addEventListener(event, evt => listener.handler.call(event))
  } else if (shouldApplyListeners) {
    applyListeners(event)
  }

  return listener
}

// export function removeByView (target) {
//   [...listeners.keys()].filter(({ view }) => view === target).forEach(listeners.delete)
// }