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

export function addDOMEventHandler (view, node, name, callback, options) {
  const shouldApplyListeners = ![...listeners.keys()].some(({ event }) => event === name)
  const listener = new DOMEventListener(...arguments)

  listeners.set({
    view,
    event: name,
    id: listener.id,
    node,
    handler: listener.handler.id
  }, listener)

  if (['blur', 'focus'].includes(name)) {
    return node.addEventListener(name, evt => listener.handler.call(name))
  } else if (shouldApplyListeners) {
    applyListeners(name)
  }

  return listener
}

export function removeDOMEventsByView (target) {
  [...listeners.keys()].filter(({ view }) => view === target).forEach(listener => listeners.delete(listener))
}

export function removeDOMEventsByNode (target) {
  [...listeners.keys()].filter(({ node }) => node === target).forEach(key => listeners.delete(key))
}

export function logListeners () {
  console.log(listeners);
  // console.log([...listeners.keys()].map(({ node }) => node))
}
