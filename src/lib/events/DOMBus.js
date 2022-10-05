import DOMEventListener from './DOMEventListener'

export let listeners = new Map
export let events = new Set

export function addDOMEventHandler (view, node, name, callback, options) {
  const shouldApplyListeners = ![...listeners.keys()].some(({ event }) => event === name) && !events.has(name)
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

function applyListeners (eventName) {
  events.add(eventName)

  return document.body.addEventListener(eventName, evt => {
    const { target } = evt

    ;[...listeners.values()]
      .filter(({ node, event }) => (target === node || node.contains(target)) && event === eventName)
      .forEach(({ view, handler }) => handler.call(view, evt))
  })
}

export function removeDOMEvents () {
  listeners = new Map
  events = new Set
}

export function removeDOMEventsByNode (target) {
  const remainingEvents = new Set

  ;[...listeners.keys()].filter(({ event, node }) => {
    const match = node === target

    if (!match) {
      remainingEvents.add(event)
    }

    return match
  }).forEach(key => listeners.delete(key))

  events = remainingEvents
}